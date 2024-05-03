import { AllSlices, SliceCreator } from '.';
import { ChainInfo } from '../components/ibc/ibc-in/chain-dropdown';
import { CosmosAssetBalance } from '../components/ibc/ibc-in/hooks';
import { getAddrByIndex } from '../fetchers/address';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { ChainWalletContext } from '@cosmos-kit/core/cjs/types/hook';
import { queryClient } from '../main';
import { Registry } from '@penumbra-labs/registry';
import { REGISTRY_QUERY_KEY } from '../fetchers/registry';
import { augmentToAsset, fromDisplayAmount } from '../components/ibc/ibc-in/asset-utils';
import { MsgTransfer } from 'osmo-query/ibc/applications/transfer/v1/tx';
import { cosmos, ibc } from 'osmo-query';
import { Toast } from '@penumbra-zone/ui/lib/toast/toast';
import { ibcChannelClient, tendermintClient } from '../clients';
import { clientStateForChannel, currentTimePlusTwoDaysRounded } from './ibc-out';
import { StdFee } from '@cosmjs/stargate';

interface PenumbraAddrs {
  ephemeral: string;
  normal: string;
}

export interface IbcInSlice {
  selectedChain?: ChainInfo;
  setSelectedChain: (chain?: ChainInfo) => void;
  coin?: CosmosAssetBalance;
  setCoin: (coin?: CosmosAssetBalance) => void;
  amount?: string;
  setAmount: (amount?: string) => void;
  penumbraAddrs?: PenumbraAddrs;
  fetchPenumbraAddrs: () => Promise<void>;
  issueTx: (
    address: string,
    getClient: ChainWalletContext['getSigningStargateClient'],
    estimateFee: ChainWalletContext['estimateFee'],
  ) => Promise<void>;
}

export const createIbcInSlice = (): SliceCreator<IbcInSlice> => (set, get) => {
  return {
    coin: undefined,
    setCoin: coin => {
      set(({ ibcIn }) => {
        ibcIn.coin = coin;
      });
    },
    amount: undefined,
    setAmount: amount => {
      set(({ ibcIn }) => {
        ibcIn.amount = amount;
      });
    },
    selectedChain: undefined,
    setSelectedChain: chain => {
      set(({ ibcIn }) => {
        ibcIn.selectedChain = chain;
        ibcIn.amount = undefined;
        ibcIn.coin = undefined;
      });
    },
    penumbraAddrs: undefined,
    fetchPenumbraAddrs: async () => {
      const normalAddr = await getAddrByIndex(0, false);
      const ephemeralAddr = await getAddrByIndex(0, true);

      set(({ ibcIn }) => {
        ibcIn.penumbraAddrs = {
          normal: bech32mAddress(normalAddr),
          ephemeral: bech32mAddress(ephemeralAddr),
        };
      });
    },
    issueTx: async (address, getClient, estimateFee) => {
      const toast = new Toast();
      try {
        toast.loading().message('Issuing IBC transaction').render();
        const { height, transactionHash } = await execute(
          get().ibcIn,
          address,
          getClient,
          estimateFee,
        );
        toast
          .success()
          .message(`Success! Height: ${height}`)
          .description(`Tx hash: ${transactionHash}`)
          .render();
      } catch (e) {
        toast.error().message('Error occurred').description(String(e)).render();
      }
    },
  };
};

async function execute(
  slice: IbcInSlice,
  address: string,
  getStargateClient: ChainWalletContext['getSigningStargateClient'],
  estimateFee: ChainWalletContext['estimateFee'],
) {
  const { penumbraAddrs, selectedChain, coin, amount } = slice;
  if (!penumbraAddrs) throw new Error('Penumbra address not available');
  if (!coin) throw new Error('No token is selected');
  if (!amount) throw new Error('Amount has not been entered');
  if (!selectedChain) throw new Error('No chain has been selected');

  const { timeoutHeight, timeoutTimestamp } = await getTimeout();
  const assetMetadata = augmentToAsset(coin.raw.denom, selectedChain.chainName);

  const transferToken = fromDisplayAmount(assetMetadata, amount);
  const params: MsgTransfer = {
    sourcePort: 'transfer',
    sourceChannel: await getCounterpartyChannelId(selectedChain),
    sender: address,
    receiver: penumbraAddrs.ephemeral,
    token: transferToken,
    timeoutHeight,
    timeoutTimestamp,
    memo: `IBC transfer from ${selectedChain.chainName} (msg transfer)`,
  };
  console.log(params);
  const ibcTransferMsg = ibc.applications.transfer.v1.MessageComposer.withTypeUrl.transfer(params);

  // const estimatedFee = await estimateFee([ibcTransferMsg]);

  // TODO: this is not right
  const estimatedFee: StdFee = {
    amount: [{ denom: transferToken.denom, amount: '1000' }],
    gas: '250000',
  };
  const client = await getStargateClient();
  const signedTx = await client.sign(
    address,
    [ibcTransferMsg],
    estimatedFee,
    `IBC transfer from ${selectedChain.chainName} (signature tx)`,
  );
  return await client.broadcastTx(cosmos.tx.v1beta1.TxRaw.encode(signedTx).finish());
}

const getCounterpartyChannelId = async (counterpartyChain: ChainInfo): Promise<string> => {
  const registry = queryClient.getQueryData<Registry>(REGISTRY_QUERY_KEY);
  if (!registry) throw new Error('Registry is not available in cache');

  const penumbraChannel = registry.ibcConnections.find(
    c => c.chainId === counterpartyChain.chainId,
  )?.ibcChannel;
  if (!penumbraChannel) {
    throw new Error(
      `Ibc channel could not be found in registry for chain id: ${counterpartyChain.chainId}`,
    );
  }

  // TODO: implement collect result of paginating through all
  // TODO: promise.race
  const { channels } = await ibcChannelClient.channels({});
  for (const channel of channels) {
    const clientState = await clientStateForChannel(channel);
    if (
      clientState.chainId === counterpartyChain.chainId &&
      channel.channelId === penumbraChannel
    ) {
      if (!channel.counterparty) {
        throw new Error(`No counterparty channelId for channel: ${channel.channelId}`);
      }
      return channel.counterparty.channelId;
    }
  }

  throw new Error(`Did not find counterparty chain id for ${penumbraChannel}`);
};

// Get timeout of penumbra chain
const getTimeout = async () => {
  const { syncInfo } = await tendermintClient.getStatus({});
  const height = syncInfo?.latestBlockHeight;
  if (height === undefined) {
    throw new Error('Could not retrieve latest block height from Tendermint');
  }

  const timeoutHeight = {
    revisionNumber: 7n, // Chain version, TODO: env var?--no pull from chain id
    revisionHeight: height + 1000n, // assuming a block time of 10s and adding ~1000 blocks (~3 hours)
  };
  const timeoutTimestamp = currentTimePlusTwoDaysRounded(Date.now());

  return { timeoutHeight, timeoutTimestamp };
};

const isIbcAsset = (denom: string): boolean => {
  const ibcRegex = /^ibc\/[0-9A-F]{64}$/i;
  return ibcRegex.test(denom);
};

export const ibcErrorSelector = (state: AllSlices) => {
  const { amount, coin } = state.ibcIn;

  const numberTooLow = Number(amount) <= 0;
  const inputAmountTooBig = Number(coin?.displayAmount) < Number(amount);
  const isNotValid = Boolean(coin) && Boolean(amount) && (inputAmountTooBig || numberTooLow);
  return {
    amountErr: isNotValid,
    // Testnet coins don't seem to have assetType field. Checking manually for ibc address first.
    isUnsupportedAsset:
      coin && (isIbcAsset(coin.raw.denom) || (coin.assetType && coin.assetType !== 'sdk.coin')),
  };
};

export const ibcInSelector = (state: AllSlices) => state.ibcIn;
