import {
  Chain,
  getAddressIndex,
  getDisplayDenomExponentFromValueView,
  getMetadata,
  toBaseUnit,
} from '@penumbra-zone/types';
import { AllSlices, SliceCreator } from '.';
import { toast } from 'sonner';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  errorTxToast,
  buildingTxToast,
  successTxToast,
  broadcastingTxToast,
} from '../components/shared/toast-content';
import BigNumber from 'bignumber.js';
import { typeRegistry } from '@penumbra-zone/types/src/registry';
import { ClientState } from '@buf/cosmos_ibc.bufbuild_es/ibc/lightclients/tendermint/v1/tendermint_pb';
import { Height } from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/client_pb';
import { ibcClient, viewClient } from '../clients/grpc';
import { authWitnessBuild, broadcast, getTxHash, plan } from './helpers';
import { AssetBalance } from '../fetchers/balances';

export interface IbcSendSlice {
  selection: AssetBalance | undefined;
  setSelection: (selection: AssetBalance) => void;
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

      const txToastId = buildingTxToast();

      try {
        const transactionPlan = await plan(await getPlanRequest(get().ibc));
        const transaction = await authWitnessBuild({ transactionPlan }, status =>
          buildingTxToast(status, txToastId),
        );
        const txHash = await getTxHash(transaction);
        const { detectionHeight } = await broadcast({ transaction, awaitDetection: true }, status =>
          broadcastingTxToast(txHash, status, txToastId),
        );

        successTxToast(txHash, detectionHeight);

        // Reset form
        set(state => {
          state.ibc.amount = '';
        });
      } catch (e) {
        errorTxToast(e, txToastId);
        throw e;
      } finally {
        set(state => {
          state.ibc.txInProgress = false;
        });
        toast.dismiss(txToastId);
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

  const addressIndex = getAddressIndex(selection.address);
  const { address: returnAddress } = await viewClient.ephemeralAddress({ addressIndex });
  if (!returnAddress) throw new Error('Error with generating IBC deposit address');

  const { timeoutHeight, timeoutTime } = await getTimeout(chain);

  return new TransactionPlannerRequest({
    ics20Withdrawals: [
      {
        amount: toBaseUnit(
          BigNumber(amount),
          getDisplayDenomExponentFromValueView(selection.value),
        ),
        denom: { denom: getMetadata(selection.value).base },
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
