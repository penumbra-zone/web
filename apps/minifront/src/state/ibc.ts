import { Chain, toBaseUnit } from '@penumbra-zone/types';
import {
  getAddressIndex,
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters';
import { AllSlices, SliceCreator } from '.';
import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { BigNumber } from 'bignumber.js';
import { typeRegistry } from '@penumbra-zone/types/registry';
import { ClientState } from '@buf/cosmos_ibc.bufbuild_es/ibc/lightclients/tendermint/v1/tendermint_pb';
import { Height } from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/client_pb';
import { ibcClient, viewClient } from '../clients';
import { planBuildBroadcast } from './helpers';

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
        await planBuildBroadcast('unknown', req);

        // Reset form
        set(state => {
          state.ibc.amount = '';
        });
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
