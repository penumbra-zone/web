import { AllSlices, SliceCreator } from '.';
import { getEphemeralAddress } from '../fetchers/address';

import {
  Address,
  AddressView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  Chain as PenumbraChain,
  getChainMetadataById,
  getChainMetadataByName,
  testnetIbcChains,
} from '@penumbra-zone/constants/src/chains';
import { PlainMessage, toPlainMessage } from '@bufbuild/protobuf';
import { amountMoreThanBalance } from './send';
import { bech32, bech32m } from 'bech32';
import { toBaseUnit } from '@penumbra-zone/types/src/lo-hi';
import { BigNumber } from 'bignumber.js';
import {
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/src/value-view';
import { viewClient } from '../clients';
import { getAddressIndex } from '@penumbra-zone/getters/src/address-view';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getTimeout } from './getTimeout';
import { planBuildBroadcast } from './helpers';
import { filterBalancesPerChain } from './filter-balances-per-chain';

export interface IbcOutSlice {
  txInProgress: boolean;

  availableBalances: PlainMessage<BalancesResponse>[];
  filteredAssets: PlainMessage<BalancesResponse>[];

  setAccount: (account: number) => Promise<void>;
  account: number;

  source: {
    address: PlainMessage<Address>;
    asset?: PlainMessage<BalancesResponse>;
    amount: bigint;
    setAsset: (asset: BalancesResponse) => void;
    setAmount: (amount: bigint) => void;
  };

  destination: {
    address: string;
    chain?: PenumbraChain;
    setAddress: (addr?: string) => void;
    setChain: (dest: { chainId: string } | { chainName: string }) => void;
  };

  unshield: () => Promise<void>;
}

export const createIbcOutSlice = (): SliceCreator<IbcOutSlice> => (set, get, store) => {
  const defaultChain = testnetIbcChains[0]!;
  return {
    txInProgress: false,
    availableBalances: [],
    filteredAssets: [],
    account: 0,
    setAccount: async (account: number) => {
      const address = await getEphemeralAddress(account);
      set(state => {
        state.ibcOut.account = account;
        state.ibcOut.source.address = toPlainMessage(address);
      });
    },
    source: {
      address: toPlainMessage(new Address()),
      amount: BigInt(0),
      asset: new BalancesResponse(),
      setAmount: (amount: bigint) => {
        set(state => {
          state.ibcOut.source.amount = amount;
        });
      },
      setAsset: (asset: BalancesResponse) => {
        set(state => {
          state.ibcOut.source.asset = toPlainMessage(asset);
        });
      },
    },
    destination: {
      address: '',
      chain: getChainMetadataById(defaultChain.chainId),
      setAddress: (addr?: string) => {
        set(state => {
          state.ibcOut.destination.address = addr ?? '';
        });
      },
      setChain: ({ chainName, chainId }: { chainName?: string; chainId?: string }) => {
        let metadata: PenumbraChain | undefined;
        if (!chainName && !chainId) throw new Error('No name or id provided');
        else if (chainId) metadata ??= getChainMetadataById(chainId);
        else if (chainName) metadata ??= getChainMetadataByName(chainName);

        const filteredAssets = filterBalancesPerChain(
          get().ibcOut.availableBalances.map(b => new BalancesResponse(b)),
          metadata,
        );

        set(state => {
          state.ibcOut.destination.chain = metadata;
          state.ibcOut.filteredAssets = filteredAssets.map(toPlainMessage);
        });
      },
    },

    unshield: async () => {
      set(state => {
        state.ibcOut.txInProgress = true;
      });

      const {
        source: { amount, asset },
        destination: { chain, address },
      } = get().ibcOut;

      if (!asset) throw new Error('No asset selected');
      if (!chain) throw new Error('No destination chain selected');

      const req = await getPlanRequest(amount, asset, chain, address);
      const tx = await planBuildBroadcast('ics20Withdrawal', req);
      console.log('ics20Withdrawal', tx);

      // Reset slice
      set(state => {
        state.ibcOut = createIbcOutSlice()(set, get, store);
      });
    },
  };
};

export const ibcOutSelector = (state: AllSlices) => state.ibcOut;

export const ibcOutDestinationSelector = (state: AllSlices) => state.ibcOut.destination;
export const ibcOutSourceSelector = (state: AllSlices) => state.ibcOut.source;

export const ibcOutValidationErrors = ({
  ibcOut: { source, destination },
  cosmosKit,
}: AllSlices) => {
  let amountErr: boolean;
  try {
    amountErr = amountMoreThanBalance(new BalancesResponse(source.asset), source.amount.toString());
  } catch (e) {
    amountErr = true;
  }

  const destLength = destination.address.length;
  const destErr = Boolean(
    destination.address &&
      destination.chain &&
      !(
        destination.address.startsWith(destination.chain.addressPrefix) && // expected prefix for the chain
        // valid bech32m
        (bech32m.decodeUnsafe(destination.address, destLength) ??
          // or valid bech32
          bech32.decodeUnsafe(destination.address, destLength))
      ),
  );

  // user has set a destination other than their own address
  const destManual = destination.address !== cosmosKit.address;

  return {
    amountErr,
    destErr,
    destManual,
  };
};

const getPlanRequest = async (
  unshieldAmount: bigint,
  unshieldAsset: PlainMessage<BalancesResponse>,
  chain?: PenumbraChain,
  destinationChainAddress?: string,
): Promise<TransactionPlannerRequest> => {
  if (!destinationChainAddress) throw new Error('no destination chain address set');
  if (!chain) throw new Error('Chain not set');

  const addressIndex = getAddressIndex(new AddressView(unshieldAsset.accountAddress));
  const { address: returnAddress } = await viewClient.ephemeralAddress({ addressIndex });
  if (!returnAddress) throw new Error('Error with generating IBC deposit address');

  const { timeoutHeight, timeoutTime } = await getTimeout(chain);

  return new TransactionPlannerRequest({
    ics20Withdrawals: [
      {
        amount: toBaseUnit(
          BigNumber(unshieldAmount.toString()),
          getDisplayDenomExponentFromValueView(new ValueView(unshieldAsset.balanceView)),
        ),
        denom: { denom: getMetadata(new ValueView(unshieldAsset.balanceView)).base },
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
