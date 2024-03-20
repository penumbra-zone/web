import { AllSlices, SliceCreator } from '.';
import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { BigNumber } from 'bignumber.js';
import { ClientState } from '@buf/cosmos_ibc.bufbuild_es/ibc/lightclients/tendermint/v1/tendermint_pb';
import { Height } from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/client_pb';
import { ibcClient, viewClient } from '../clients';
import { Chain } from '@penumbra-zone/constants/src/chains';
import {
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/src/value-view';
import { getAddressIndex } from '@penumbra-zone/getters/src/address-view';
import { typeRegistry } from '@penumbra-zone/types/src/registry';
import { toBaseUnit } from '@penumbra-zone/types/src/lo-hi';
import { planBuildBroadcast } from './helpers';
import { validateAmount } from './send';
import { IbcLoaderResponse } from '../components/ibc/ibc-loader';
import { getAssetId } from '@penumbra-zone/getters/src/metadata';
import {
  assetPatterns,
  localAssets,
  STAKING_TOKEN_METADATA,
} from '@penumbra-zone/constants/src/assets';
import { bech32IsValid } from '@penumbra-zone/bech32';
import { errorToast } from '@penumbra-zone/ui';

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

const getTimeout = async (
  chain: Chain,
): Promise<{ timeoutTime: bigint; timeoutHeight: Height }> => {
  const twoDaysInMilliseconds = 2 * 24 * 60 * 60 * 1000; // 2 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute * 1000 milliseconds/second
  const timeoutTime = BigInt(Date.now() + twoDaysInMilliseconds);

  const { clientStates } = await ibcClient.clientStates({});
  const unpacked = clientStates
    .map(cs => cs.clientState!.unpack(typeRegistry))
    .filter(Boolean) as ClientState[];

  const clientState = unpacked.find(cs => cs.chainId === chain.chainId);
  if (!clientState) throw new Error('Could not find chain id client state');

  // assuming a block time of 10s and adding ~1000 blocks (~3 hours)
  const revisionHeight = clientState.latestHeight!.revisionHeight + 1000n;

  return {
    timeoutTime,
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
    amountErr: !state.ibc.selection ? false : validateAmount(state.ibc.selection, state.ibc.amount),
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
  allBalances: IbcLoaderResponse,
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
