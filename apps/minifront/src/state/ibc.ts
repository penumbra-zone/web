import { AllSlices, SliceCreator } from '.';
import { getEphemeralAddress } from '../fetchers/address';

import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  Chain as PenumbraChain,
  getChainMetadataById,
  getChainMetadataByName,
} from '@penumbra-zone/constants/src/chains';
import {
  CosmosChain,
  getCosmosChainById,
  getCosmosChainByName,
} from '@penumbra-zone/constants/src/cosmos';
import { PlainMessage, toPlainMessage } from '@bufbuild/protobuf';
import { ChainContext } from '@cosmos-kit/core';
import { amountMoreThanBalance } from './send';
import { bech32, bech32m } from 'bech32';
import { joinLoHi, toBaseUnit } from '@penumbra-zone/types/src/lo-hi';
import BigNumber from 'bignumber.js';
import {
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/src/value-view';
import { ibcClient, viewClient } from '../clients';
import { getAddressIndex } from '@penumbra-zone/getters/src/address-view';
import { typeRegistry } from '@penumbra-zone/types/src/registry';
import { ClientState } from '@buf/cosmos_ibc.bufbuild_es/ibc/lightclients/tendermint/v1/tendermint_pb';
import { Height } from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/client_pb';

export interface IbcSlice {
  txInProgress: boolean;
  assetBalances?: PlainMessage<BalancesResponse>[];
  penumbraChain?: PenumbraChain;
  cosmosChain?: CosmosChain;
  setChainByName: (chainName: string) => void;
  setChainById: (chainId: string) => void;
  penumbra: {
    account: number;
    address: PlainMessage<Address>;
    unshieldAsset?: PlainMessage<BalancesResponse>;
    unshieldAmount?: bigint;
    setAccount: (account: number) => Promise<void>;
    setUnshield: (asset: BalancesResponse, amount: bigint) => void;
  };
  cosmos: {
    rpcEndpoint?: string;
    destination?: string;
    setChainContext: (ctx: ChainContext) => Promise<void>;
    setDestination: (addr?: string) => void;
  };
  //sendUnshieldTx: () => Promise<void>;
  //sendShieldTx: () => Promise<void>;
}

export const createIbcSlice = (): SliceCreator<IbcSlice> => set => {
  return {
    txInProgress: false,
    setChainByName: (chainName: string) => {
      if (!chainName) return;
      const penumbraChain = getChainMetadataByName(chainName);
      const cosmosChain = getCosmosChainByName(chainName);
      set(state => {
        state.ibc.penumbraChain = penumbraChain!;
        state.ibc.cosmosChain = cosmosChain!;
      });
    },
    setChainById: (chainId: string) => {
      if (!chainId) return;
      const penumbraChain = getChainMetadataById(chainId);
      const cosmosChain = getCosmosChainById(chainId);
      set(state => {
        state.ibc.penumbraChain = penumbraChain!;
        state.ibc.cosmosChain = cosmosChain!;
      });
    },
    penumbra: {
      account: 0,
      address: toPlainMessage(new Address()),
      setAccount: async (account: number) => {
        const address = await getEphemeralAddress(account);
        set(state => {
          state.ibc.penumbra.account = account;
          state.ibc.penumbra.address = toPlainMessage(address);
        });
      },
      setUnshield: (asset: BalancesResponse, amount: bigint) => {
        set(state => {
          state.ibc.penumbra.unshieldAsset = toPlainMessage(asset);
          state.ibc.penumbra.unshieldAmount = amount;
        });
      },
    },
    cosmos: {
      setDestination: (addr?: string) => {
        set(state => {
          state.ibc.cosmos.destination = addr ?? '';
        });
      },
      setChainContext: async ({ getRpcEndpoint, address }: ChainContext) => {
        const rpcEndpoint = await getRpcEndpoint().then(ep =>
          typeof ep === 'string' ? ep : ep.url,
        );
        set(state => {
          state.ibc.cosmos.destination ??= address;
          state.ibc.cosmos.rpcEndpoint = rpcEndpoint;
        });
      },
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    sendUnshieldTx: async () => {
      set(state => {
        state.send.txInProgress = true;
      });

      /*
      try {
        const {} = get().ibc;
        const req = await getPlanRequest();
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
      */
    },
  };
};

export const ibcPenumbraSelector = (state: AllSlices) => state.ibc.penumbra;
export const ibcCosmosSelector = (state: AllSlices) => state.ibc.cosmos;
export const ibcSelector = (state: AllSlices) => state.ibc;

export const ibcValidationErrors = (state: AllSlices) => {
  const inputBalance =
    state.ibc.penumbra.unshieldAsset?.balanceView?.valueView.case === 'knownAssetId'
      ? state.ibc.penumbra.unshieldAsset.balanceView.valueView.value
      : undefined;
  const availableBalance = state.ibc.assetBalances?.find(
    ({ balanceView }) =>
      balanceView?.valueView.case === 'knownAssetId' &&
      balanceView.valueView.value.metadata?.penumbraAssetId ===
        inputBalance?.metadata?.penumbraAssetId,
  );
  const inputAmount = joinLoHi(inputBalance?.amount?.lo, inputBalance?.amount?.hi).toString();

  // bech32 byte length is definitely shorter than the bech32 string length
  const limit = state.ibc.cosmos.destination?.length;

  let amountErr: boolean;
  try {
    amountErr = amountMoreThanBalance(new BalancesResponse(availableBalance), inputAmount);
  } catch (e) {
    amountErr = true;
  }

  return {
    destinationErr: Boolean(
      state.ibc.cosmosChain &&
        state.ibc.cosmos.destination &&
        (bech32m.decodeUnsafe(state.ibc.cosmos.destination, limit) ??
          bech32.decodeUnsafe(state.ibc.cosmos.destination, limit)),
    ),
    unshieldAmountErr: Boolean(
      state.ibc.penumbra.unshieldAsset?.balanceView?.valueView.case === 'knownAssetId' && amountErr,
    ),
  };
};

const getTimeout = async (
  chain: PenumbraChain,
): Promise<{ timeoutTime: bigint; timeoutHeight: Height }> => {
  // timeout 2 days from now, in nanoseconds since epoch
  const twoDaysMs = BigInt(2 * 24 * 60 * 60 * 1000); // 2 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute * 1000 milliseconds per second
  // truncate resolution at seconds, to obfuscate clock skew
  const lowPrecisionNowMs = BigInt(Math.floor(Date.now() / 1000) * 1000); // ms/1000 to second, floor, second*1000 to ms
  // (now + two days) as nanoseconds
  const timeoutTime = (lowPrecisionNowMs + twoDaysMs) * 1_000_000n; // 1 million nanoseconds per millisecond

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

const getPlanRequest = async (
  unshieldAmount: bigint,
  unshieldAsset?: BalancesResponse,
  chain?: PenumbraChain,
  destinationChainAddress?: string,
): Promise<TransactionPlannerRequest> => {
  if (!destinationChainAddress) throw new Error('no destination chain address set');
  if (!chain) throw new Error('Chain not set');
  if (!unshieldAsset) throw new Error('No asset selected');

  const addressIndex = getAddressIndex(unshieldAsset.accountAddress);
  const { address: returnAddress } = await viewClient.ephemeralAddress({ addressIndex });
  if (!returnAddress) throw new Error('Error with generating IBC deposit address');

  const { timeoutHeight, timeoutTime } = await getTimeout(chain);

  return new TransactionPlannerRequest({
    ics20Withdrawals: [
      {
        amount: toBaseUnit(
          BigNumber(unshieldAmount.toString()),
          getDisplayDenomExponentFromValueView(unshieldAsset.balanceView),
        ),
        denom: { denom: getMetadata(unshieldAsset.balanceView).base },
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
