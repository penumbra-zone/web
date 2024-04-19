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
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/src/value-view';
import { getAddressIndex } from '@penumbra-zone/getters/src/address-view';
import { toBaseUnit } from '@penumbra-zone/types/src/lo-hi';
import { planBuildBroadcast } from './helpers';
import { amountMoreThanBalance } from './send';
import { getAssetId } from '@penumbra-zone/getters/src/metadata';
import {
  assetPatterns,
  localAssets,
  STAKING_TOKEN_METADATA,
} from '@penumbra-zone/constants/src/assets';
import { bech32IsValid } from '@penumbra-zone/bech32/src/validate';
import { errorToast } from '@penumbra-zone/ui/lib/toast/presets';
import { Chain } from '@penumbra-labs/registry';

export interface IbcSendSlice {
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

export const createIbcSendSlice = (): SliceCreator<IbcSendSlice> => (set, get) => {
  return {
    amount: '',
    selection: undefined,
    chain: undefined,
    destinationChainAddress: '',
    txInProgress: false,
    setSelection: selection => {
      set(state => {
        state.ibc.selection = selection;
      });
    },
    setAmount: amount => {
      set(state => {
        state.ibc.amount = amount;
      });
    },
    setChain: chain => {
      set(state => {
        state.ibc.chain = chain;
      });
    },
    setDestinationChainAddress: addr => {
      set(state => {
        state.ibc.destinationChainAddress = addr;
      });
    },
    sendIbcWithdraw: async () => {
      set(state => {
        state.send.txInProgress = true;
      });

      try {
        const req = await getPlanRequest(get().ibc);
        await planBuildBroadcast('ics20Withdrawal', req);

        // Reset form
        set(state => {
          state.ibc.amount = '';
        });
      } catch (e) {
        errorToast(e, 'Ics20 withdrawal error').render();
      } finally {
        set(state => {
          state.ibc.txInProgress = false;
        });
      }
    },
  };
};

// Timeout is two days. However, in order to prevent identifying oneself by clock skew,
// timeout time is rounded up to the nearest 10 minute interval.
// Reference in core: https://github.com/penumbra-zone/penumbra/blob/1376d4b4f47f44bcc82e8bbdf18262942edf461e/crates/bin/pcli/src/command/tx.rs#L1066-L1067
export const currentTimePlusTwoDaysRounded = (currentTimeMs: number): bigint => {
  const tenMinsMs = 1000 * 60 * 10;
  const twoDaysMs = 1000 * 60 * 60 * 24 * 2;

  const twoDaysFromNowMs = currentTimeMs + twoDaysMs;

  // round to next ten-minute interval
  const roundedTimeoutMs = twoDaysFromNowMs + tenMinsMs - (twoDaysFromNowMs % tenMinsMs);

  // 1 million nanoseconds per millisecond (converted to bigint)
  const roundedTimeoutNs = BigInt(roundedTimeoutMs) * 1_000_000n;

  return roundedTimeoutNs;
};

// Reference in core: https://github.com/penumbra-zone/penumbra/blob/1376d4b4f47f44bcc82e8bbdf18262942edf461e/crates/bin/pcli/src/command/tx.rs#L998-L1050
const getTimeout = async (
  chain: Chain,
): Promise<{ timeoutTime: bigint; timeoutHeight: Height }> => {
  const { channel } = await ibcChannelClient.channel({
    portId: 'transfer',
    channelId: chain.ibcChannel,
  });

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

  // assuming a block time of 10s and adding ~1000 blocks (~3 hours)
  const revisionHeight = clientState.latestHeight!.revisionHeight + 1000n;

  return {
    timeoutTime: currentTimePlusTwoDaysRounded(Date.now()),
    timeoutHeight: new Height({
      revisionHeight,
      revisionNumber: clientState.latestHeight!.revisionNumber,
    }),
  };
};

const getPlanRequest = async ({
  amount,
  selection,
  chain,
  destinationChainAddress,
}: IbcSendSlice): Promise<TransactionPlannerRequest> => {
  if (!destinationChainAddress) throw new Error('no destination chain address set');
  if (!chain) throw new Error('Chain not set');
  if (!selection) throw new Error('No asset selected');

  const addressIndex = getAddressIndex(selection.accountAddress);
  const { address: returnAddress } = await viewClient.ephemeralAddress({ addressIndex });
  if (!returnAddress) throw new Error('Error with generating IBC deposit address');

  const { timeoutHeight, timeoutTime } = await getTimeout(chain);

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
        sourceChannel: chain.ibcChannel,
      },
    ],
    source: addressIndex,
  });
};

export const ibcSelector = (state: AllSlices) => state.ibc;

export const ibcValidationErrors = (state: AllSlices) => {
  return {
    recipientErr: !state.ibc.destinationChainAddress
      ? false
      : !validateAddress(state.ibc.chain, state.ibc.destinationChainAddress),
    amountErr: !state.ibc.selection
      ? false
      : amountMoreThanBalance(state.ibc.selection, state.ibc.amount),
  };
};

const validateAddress = (chain: Chain | undefined, address: string): boolean => {
  if (!chain || address === '') return false;
  return bech32IsValid(address, chain.addressPrefix);
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
): BalancesResponse[] => {
  const penumbraAssetId = getAssetId(STAKING_TOKEN_METADATA);
  const assetsWithMatchingChannel = localAssets
    .filter(a => {
      const match = assetPatterns.ibc.capture(a.base);
      if (!match) return false;
      return chain?.ibcChannel === match.channel;
    })
    .map(m => m.penumbraAssetId!);

  const assetIdsToCheck = [penumbraAssetId, ...assetsWithMatchingChannel];

  return allBalances.filter(({ balanceView }) => {
    const metadata = getMetadata(balanceView);
    return assetIdsToCheck.some(assetId => assetId.equals(metadata.penumbraAssetId));
  });
};
