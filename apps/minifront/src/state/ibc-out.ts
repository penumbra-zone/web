import { AllSlices, SliceCreator } from '.';
import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { BigNumber } from 'bignumber.js';
import { ClientState } from '@buf/cosmos_ibc.bufbuild_es/ibc/lightclients/tendermint/v1/tendermint_pb';
import { Height } from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/client_pb';
import { ibcChannelClient, ibcClient, ibcConnectionClient, viewClient } from '../clients';
import {
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';
import { planBuildBroadcast } from './helpers';
import { amountMoreThanBalance } from './send';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { bech32, bech32m } from 'bech32';
import { errorToast } from '@repo/ui/lib/toast/presets';
import { Chain } from '@penumbra-labs/registry';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Channel } from '@buf/cosmos_ibc.bufbuild_es/ibc/core/channel/v1/channel_pb';
import { BLOCKS_PER_HOUR } from './constants';

export interface IbcOutSlice {
  selection: BalancesResponse | undefined;
  setSelection: (selection: BalancesResponse) => void;
  amount: string;
  setAmount: (amount: string) => void;
  chain: Chain | undefined;
  destinationChainAddress: string;
  setDestinationChainAddress: (addr: string) => void;
  setChain: (chain: Chain | undefined) => void;
  sendIbcWithdraw: () => Promise<void>;
  txInProgress: boolean;
}

export const createIbcOutSlice = (): SliceCreator<IbcOutSlice> => (set, get) => {
  return {
    amount: '',
    selection: undefined,
    chain: undefined,
    destinationChainAddress: '',
    txInProgress: false,
    setSelection: selection => {
      set(state => {
        state.ibcOut.selection = selection;
      });
    },
    setAmount: amount => {
      set(state => {
        state.ibcOut.amount = amount;
      });
    },
    setChain: chain => {
      set(state => {
        state.ibcOut.chain = chain;
      });
    },
    setDestinationChainAddress: addr => {
      set(state => {
        state.ibcOut.destinationChainAddress = addr;
      });
    },
    sendIbcWithdraw: async () => {
      set(state => {
        state.send.txInProgress = true;
      });

      try {
        const req = await getPlanRequest(get().ibcOut);
        await planBuildBroadcast('ics20Withdrawal', req);

        // Reset form
        set(state => {
          state.ibcOut.amount = '';
        });
      } catch (e) {
        errorToast(e, 'Ics20 withdrawal error').render();
      } finally {
        set(state => {
          state.ibcOut.txInProgress = false;
        });
      }
    },
  };
};

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

  const { connection } = await ibcConnectionClient.connection({
    connectionId,
  });
  const clientId = connection?.clientId;
  if (!clientId) {
    throw new Error('no clientId ConnectionEnd returned from ibcConnectionClient request');
  }

  const { clientState: anyClientState } = await ibcClient.clientState({ clientId: clientId });
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
  const { channel } = await ibcChannelClient.channel({
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

const getPlanRequest = async ({
  amount,
  selection,
  chain,
  destinationChainAddress,
}: IbcOutSlice): Promise<TransactionPlannerRequest> => {
  if (!destinationChainAddress) throw new Error('no destination chain address set');
  if (!chain) throw new Error('Chain not set');
  if (!selection) throw new Error('No asset selected');

  const addressIndex = getAddressIndex(selection.accountAddress);
  const { address: returnAddress } = await viewClient.ephemeralAddress({ addressIndex });
  if (!returnAddress) throw new Error('Error with generating IBC deposit address');

  const { timeoutHeight, timeoutTime } = await getTimeout(chain.channelId);

  return new TransactionPlannerRequest({
    ics20Withdrawals: [
      {
        amount: toBaseUnit(
          BigNumber(amount),
          getDisplayDenomExponentFromValueView(selection.balanceView),
        ),
        denom: { denom: getMetadata(selection.balanceView).base },
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

export const ibcOutSelector = (state: AllSlices) => state.ibcOut;

export const ibcValidationErrors = (state: AllSlices) => {
  return {
    recipientErr: !state.ibcOut.destinationChainAddress
      ? false
      : !unknownAddrIsValid(state.ibcOut.chain, state.ibcOut.destinationChainAddress),
    amountErr: !state.ibcOut.selection
      ? false
      : amountMoreThanBalance(state.ibcOut.selection, state.ibcOut.amount),
  };
};

/**
 * Matches the given address to the chain's address prefix.
 * We don't know what format foreign addresses are in, so this only checks:
 * - it's valid bech32 OR valid bech32m
 * - the prefix matches the chain
 */
const unknownAddrIsValid = (chain: Chain | undefined, address: string): boolean => {
  if (!chain || address === '') return false;
  const { prefix, words } =
    bech32.decodeUnsafe(address, Infinity) ?? bech32m.decodeUnsafe(address, Infinity) ?? {};
  return !!words && prefix === chain.addressPrefix;
};

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
  const penumbraAssetId = getAssetId(stakingTokenMetadata);
  const assetsWithMatchingChannel = registryAssets
    .filter(a => {
      const match = assetPatterns.ibc.capture(a.base);
      if (!match) return false;
      return chain?.channelId === match.channel;
    })
    .map(m => m.penumbraAssetId!);

  const assetIdsToCheck = [penumbraAssetId, ...assetsWithMatchingChannel];

  return allBalances.filter(({ balanceView }) => {
    return assetIdsToCheck.some(assetId => assetId.equals(getAssetIdFromValueView(balanceView)));
  });
};
