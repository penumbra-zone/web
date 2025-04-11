import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { BigNumber } from 'bignumber.js';
import { ClientState } from '@penumbra-zone/protobuf/ibc/lightclients/tendermint/v1/tendermint_pb';
import { Height } from '@penumbra-zone/protobuf/ibc/core/client/v1/client_pb';
import {
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';

import { getAssetId } from '@penumbra-zone/getters/metadata';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { bech32, bech32m } from 'bech32';
import { Chain } from '@penumbra-labs/registry';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Channel } from '@penumbra-zone/protobuf/ibc/core/channel/v1/channel_pb';
import { BLOCKS_PER_HOUR } from './constants';
import {
  IbcChannelService,
  IbcClientService,
  IbcConnectionService,
  ViewService,
} from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import {
  amountMoreThanBalance,
  isIncorrectDecimal,
} from '@/entities/transaction/model/validations.ts';
import { makeAutoObservable, runInAction } from 'mobx';
import { getChains } from '../fetchers/registry';
import { openToast } from '@penumbra-zone/ui/Toast';
import { planBuildBroadcast } from '@/entities/transaction';

const tenMinsMs = 1000 * 60 * 10;
const twoDaysMs = 1000 * 60 * 60 * 24 * 2;

// Timeout is two days. However, in order to prevent identifying oneself by clock skew,
// timeout time is rounded up to the nearest 10 minute interval.
// Reference in core: https://github.com/penumbra-zone/penumbra/blob/1376d4b4f47f44bcc82e8bbdf18262942edf461e/crates/bin/pcli/src/command/tx.rs#L1066-L1067
export const currentTimePlusTwoDaysRounded = (currentTimeMs: number): bigint => {
  const twoDaysFromNowMs = currentTimeMs + twoDaysMs;

  // round to next ten-minute interval
  const roundedTimeoutMs = twoDaysFromNowMs + tenMinsMs - (twoDaysFromNowMs % tenMinsMs);

  // 1 million nanoseconds per millisecond (converted to bigint)
  const roundedTimeoutNs = BigInt(roundedTimeoutMs) * 1_000_000n;

  return roundedTimeoutNs;
};

const clientStateForChannel = async (channel?: Channel): Promise<ClientState> => {
  const connectionId = channel?.connectionHops[0];
  if (!connectionId) {
    throw new Error('no connectionId in channel returned from ibcChannelClient request');
  }

  const { connection } = await penumbra.service(IbcConnectionService).connection({
    connectionId,
  });
  const clientId = connection?.clientId;
  if (!clientId) {
    throw new Error('no clientId ConnectionEnd returned from ibcConnectionClient request');
  }

  const { clientState: anyClientState } = await penumbra
    .service(IbcClientService)
    .clientState({ clientId: clientId });
  if (!anyClientState) {
    throw new Error(`Could not get state for client id ${clientId}`);
  }

  const clientState = new ClientState();
  const success = anyClientState.unpackTo(clientState); // Side effect of augmenting input clientState with data
  if (!success) {
    throw new Error(`Error while trying to unpack Any to ClientState for client id ${clientId}`);
  }

  return clientState;
};

// Reference in core: https://github.com/penumbra-zone/penumbra/blob/1376d4b4f47f44bcc82e8bbdf18262942edf461e/crates/bin/pcli/src/command/tx.rs#L998-L1050
const getTimeout = async (
  ibcChannelId: string,
): Promise<{ timeoutTime: bigint; timeoutHeight: Height }> => {
  const { channel } = await penumbra.service(IbcChannelService).channel({
    portId: 'transfer',
    channelId: ibcChannelId,
  });

  const clientState = await clientStateForChannel(channel);
  if (!clientState.latestHeight) {
    throw new Error(`latestHeight not provided in client state for ${clientState.chainId}`);
  }

  return {
    timeoutTime: currentTimePlusTwoDaysRounded(Date.now()),
    timeoutHeight: new Height({
      revisionHeight: clientState.latestHeight.revisionHeight + BLOCKS_PER_HOUR * 3n,
      revisionNumber: clientState.latestHeight.revisionNumber,
    }),
  };
};

const getPlanRequest = async (ibcOutStore: IbcOutStore): Promise<TransactionPlannerRequest> => {
  const { amount, selection, chain, destinationChainAddress } = ibcOutStore;

  if (!destinationChainAddress) {
    throw new Error('no destination chain address set');
  }
  if (!chain) {
    throw new Error('Chain not set');
  }
  if (!selection) {
    throw new Error('No asset selected');
  }

  const addressIndex = getAddressIndex(selection.accountAddress);
  const { address: returnAddress } = await penumbra
    .service(ViewService)
    .ephemeralAddress({ addressIndex });
  if (!returnAddress) {
    throw new Error('Error with generating IBC deposit address');
  }

  const { timeoutHeight, timeoutTime } = await getTimeout(chain.channelId);

  // IBC-related fields
  const denom = getMetadata(selection.balanceView).base;

  return new TransactionPlannerRequest({
    ics20Withdrawals: [
      {
        amount: toBaseUnit(
          BigNumber(amount),
          getDisplayDenomExponentFromValueView(selection.balanceView),
        ),
        denom: { denom },
        destinationChainAddress,
        returnAddress,
        timeoutHeight,
        timeoutTime,
        sourceChannel: chain.channelId,
      },
    ],
    source: addressIndex,
  });
};

// These chains do not allow IBC-in transfers unless the token is native to the chain
export const NATIVE_TRANSFERS_ONLY_CHAIN_IDS = ['celestia'];

/**
 * Filters the given IBC loader response balances by checking if any of the assets
 * in the balance view match the staking token's asset ID or are of the same ibc channel.
 *
 * Until unwind support is implemented (https://github.com/penumbra-zone/web/issues/344),
 * we need to ensure ics20 withdraws match these conditions.
 */
export const filterBalancesPerChain = (
  allBalances: BalancesResponse[],
  chain: Chain | undefined,
  registryAssets: Metadata[],
  stakingTokenMetadata?: Metadata,
): BalancesResponse[] => {
  const penumbraAssetId = getAssetId.optional(stakingTokenMetadata);
  const assetsWithMatchingChannel = registryAssets
    .filter(a => {
      const match = assetPatterns.ibc.capture(a.base);
      if (!match) {
        return false;
      }
      return chain?.channelId === match.channel;
    })
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify
    .map(m => m.penumbraAssetId!);

  const assetIdsToCheck = [...assetsWithMatchingChannel];

  if (
    chain?.chainId &&
    penumbraAssetId &&
    !NATIVE_TRANSFERS_ONLY_CHAIN_IDS.includes(chain.chainId)
  ) {
    assetIdsToCheck.push(penumbraAssetId);
  }

  return allBalances.filter(({ balanceView }) => {
    return assetIdsToCheck.some(assetId => assetId.equals(getAssetIdFromValueView(balanceView)));
  });
};

/**
 * Matches the given address to the chain's address prefix.
 * We don't know what format foreign addresses are in, so this only checks:
 * - it's valid bech32 OR valid bech32m
 * - the prefix matches the chain
 */
const unknownAddrIsValid = (chain: Chain | undefined, address: string): boolean => {
  if (!chain || address === '') {
    return false;
  }
  const { prefix, words } =
    bech32.decodeUnsafe(address, Infinity) ?? bech32m.decodeUnsafe(address, Infinity) ?? {};
  return !!words && prefix === chain.addressPrefix;
};

export class IbcOutStore {
  // State
  selection: BalancesResponse | undefined = undefined;
  amount = '';
  chain: Chain | undefined = undefined;
  destinationChainAddress = '';
  txInProgress = false;
  chains: Chain[] = [];
  chainsLoading = false;
  chainsError: Error | null = null;

  constructor() {
    makeAutoObservable(this);
    void this.fetchChains();
  }

  // Actions
  setSelection = (selection: BalancesResponse): void => {
    this.selection = selection;
  };

  setAmount = (amount: string): void => {
    this.amount = amount;
  };

  setChain = (chain: Chain | undefined): void => {
    this.chain = chain;

    // Update the selection when chain changes
    if (this.filteredBalances.length > 0) {
      this.selection = this.filteredBalances[0];
    } else {
      this.selection = undefined;
    }
  };

  setDestinationChainAddress = (addr: string): void => {
    this.destinationChainAddress = addr;
  };

  fetchChains = async (): Promise<void> => {
    this.chainsLoading = true;
    this.chainsError = null;

    try {
      const fetchedChains = await getChains();
      runInAction(() => {
        this.chains = fetchedChains;
      });
    } catch (error) {
      runInAction(() => {
        this.chainsError = error instanceof Error ? error : new Error(String(error));
      });
    } finally {
      runInAction(() => {
        this.chainsLoading = false;
      });
    }
  };

  sendIbcWithdraw = async (): Promise<void> => {
    this.txInProgress = true;

    try {
      const req = await getPlanRequest(this);
      await planBuildBroadcast('ics20Withdrawal', req);

      // Reset form
      this.amount = '';

      openToast({
        type: 'success',
        message: 'Your IBC withdrawal transaction was submitted successfully',
      });
    } catch (e) {
      openToast({
        type: 'error',
        message: e instanceof Error ? e.message : String(e),
      });
    } finally {
      this.txInProgress = false;
    }
  };

  // Computed properties
  get filteredBalances(): BalancesResponse[] {
    // This would typically get all balances, assets, and staking token metadata from a shared store
    // For this implementation, we'll need to pass these values when calling the method
    return [];
  }

  getFilteredBalances(
    balances: BalancesResponse[],
    assets: Metadata[],
    stakingTokenMetadata?: Metadata,
  ): BalancesResponse[] {
    return filterBalancesPerChain(balances, this.chain, assets, stakingTokenMetadata);
  }

  getPlaceholder(
    balances: BalancesResponse[],
    assets: Metadata[],
    stakingTokenMetadata?: Metadata,
  ): string {
    const filteredBalances = this.getFilteredBalances(balances, assets, stakingTokenMetadata);
    if (!this.chain) {
      return 'Select a chain';
    }
    if (filteredBalances.length === 0) {
      return 'No balances to transfer';
    }
    return 'Enter an amount';
  }

  getValidationErrors(): {
    recipientErr: boolean;
    amountErr: boolean;
    exponentErr: boolean;
  } {
    // Use the selection from the store, not the passed parameters
    return {
      recipientErr: !this.destinationChainAddress
        ? false
        : !unknownAddrIsValid(this.chain, this.destinationChainAddress),
      amountErr: !this.selection ? false : amountMoreThanBalance(this.selection, this.amount),
      exponentErr: !this.selection ? false : isIncorrectDecimal(this.selection, this.amount),
    };
  }
}

export const ibcOutStore = new IbcOutStore();
