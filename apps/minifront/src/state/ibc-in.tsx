import { ChainInfo } from '../components/ibc/ibc-in/chain-dropdown';
import { CosmosAssetBalance } from '../components/ibc/ibc-in/hooks';
import { ChainWalletContext } from '@cosmos-kit/core';
import { AllSlices, SliceCreator } from '.';
import { getAddrByIndex } from '../fetchers/address';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { Toast } from '@repo/ui/lib/toast/toast';
import { shorten } from '@penumbra-zone/types/string';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { bech32CompatAddress } from '@penumbra-zone/bech32m/penumbracompat1';
import { calculateFee, GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { chains } from 'chain-registry';
import { getChainId } from '../fetchers/chain-id';
import { augmentToAsset, fromDisplayAmount } from '../components/ibc/ibc-in/asset-utils';
import { cosmos, ibc } from 'osmo-query';
import { chainRegistryClient } from '../fetchers/registry';
import { tendermintClient } from '../clients';
import { BLOCKS_PER_HOUR } from './constants';
import { currentTimePlusTwoDaysRounded } from './ibc-out';
import { EncodeObject } from '@cosmjs/proto-signing';
import { MsgTransfer } from 'osmo-query/ibc/applications/transfer/v1/tx';

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
    getClient: ChainWalletContext['getSigningStargateClient'],
    address?: string,
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

      const chain = get().ibcIn.selectedChain;
      if (!chain) throw new Error('No chain selected');

      set(({ ibcIn }) => {
        ibcIn.penumbraAddrs = {
          normal: bech32mAddress(normalAddr),
          ephemeral: getCompatibleBech32(chain.chainName, ephemeralAddr),
        };
      });
    },
    issueTx: async (getClient, address) => {
      const toast = new Toast();
      try {
        toast.loading().message('Issuing IBC transaction').render();

        if (!address) throw new Error('Address not selected');
        const { code, transactionHash, height } = await execute(get().ibcIn, address, getClient);

        // The transaction succeeded if and only if code is 0.
        if (code !== 0) {
          throw new Error(`Tendermint error: ${code}`);
        }

        // If we have a block explorer tx page link for this chain id, include it in toast
        const chainId = get().ibcIn.selectedChain?.chainId;
        const explorerTxPage = getExplorerPage(transactionHash, chainId);
        if (explorerTxPage) {
          toast.action(
            <a href={explorerTxPage} target='_blank' rel='noreferrer'>
              See details
            </a>,
          );
        }

        const chainName = get().ibcIn.selectedChain?.chainName;
        toast
          .success()
          .message(`IBC transaction succeeded! 🎉`)
          .description(
            `Transaction ${shorten(transactionHash, 8)} appeared on ${chainName} at height ${height}.`,
          )
          .render();
      } catch (e) {
        toast.error().message('Transaction error ❌').description(String(e)).render();
      }
    },
  };
};

const getExplorerPage = (txHash: string, chainId?: string) => {
  if (!chainId) return undefined;

  // They come in the format of "https://mintscan.io/noble-testnet/txs/${txHash}"
  const txPage = chains.find(({ chain_id }) => chain_id === chainId)?.explorers?.[0]?.tx_page;
  if (!txPage) return undefined;

  return txPage.replace('${txHash}', txHash);
};

/**
 * For Noble specifically we need to use a Bech32 encoding rather than Bech32m,
 * because Noble currently has a middleware that decodes as Bech32.
 * Noble plans to change this at some point in the future but until then we need
 * to use a special encoding just for Noble specifically.
 */
const bech32Chains = ['noble', 'nobletestnet'];
const getCompatibleBech32 = (chainName: string, address: Address): string => {
  return bech32Chains.includes(chainName) ? bech32CompatAddress(address) : bech32mAddress(address);
};

const estimateFee = async ({
  chainId,
  client,
  signerAddress,
  message,
}: {
  chainId: string;
  client: SigningStargateClient;
  signerAddress: string;
  message: EncodeObject;
}) => {
  const feeToken = chains.find(({ chain_id }) => chain_id === chainId)?.fees?.fee_tokens[0];
  const avgGasPrice = feeToken?.average_gas_price;
  if (!feeToken) throw new Error(`Fee token not found in registry for ${chainId}`);
  if (!avgGasPrice) throw new Error(`Average gas price not found for ${chainId}`);

  const estimatedGas = await client.simulate(signerAddress, [message], '');
  const gasLimit = Math.round(estimatedGas * 1.5); // Give some padding to the limit due to fluctuations
  const gasPrice = GasPrice.fromString(`${feeToken.average_gas_price}${feeToken.denom}`); // e.g. 132uosmo
  return calculateFee(gasLimit, gasPrice);
};

async function execute(
  slice: IbcInSlice,
  address: string,
  getStargateClient: ChainWalletContext['getSigningStargateClient'],
) {
  const { penumbraAddrs, selectedChain, coin, amount } = slice;
  if (!penumbraAddrs) throw new Error('Penumbra address not available');
  if (!coin) throw new Error('No token is selected');
  if (!amount) throw new Error('Amount has not been entered');
  if (!selectedChain) throw new Error('No chain has been selected');

  const penumbraChainId = await getChainId();
  if (!penumbraChainId) throw new Error('Penumbra chain id could not be retrieved');

  const { timeoutHeight, timeoutTimestamp } = await getTimeout(penumbraChainId);
  const assetMetadata = augmentToAsset(coin.raw.denom, selectedChain.chainName);

  const transferToken = fromDisplayAmount(assetMetadata, coin.displayDenom, amount);
  const params: MsgTransfer = {
    sourcePort: 'transfer',
    sourceChannel: getCounterpartyChannelId(selectedChain, penumbraChainId),
    sender: address,
    receiver: penumbraAddrs.ephemeral,
    token: transferToken,
    timeoutHeight,
    timeoutTimestamp,
    memo: '',
  };
  const ibcTransferMsg = ibc.applications.transfer.v1.MessageComposer.withTypeUrl.transfer(params);

  const client = await getStargateClient();
  const fee = await estimateFee({
    chainId: selectedChain.chainId,
    client,
    signerAddress: address,
    message: ibcTransferMsg,
  });

  const signedTx = await client.sign(address, [ibcTransferMsg], fee, '');
  return await client.broadcastTx(cosmos.tx.v1beta1.TxRaw.encode(signedTx).finish());
}

const getCounterpartyChannelId = (
  counterpartyChain: ChainInfo,
  penumbraChainId: string,
): string => {
  const registry = chainRegistryClient.get(penumbraChainId);

  const counterpartyChannelId = registry.ibcConnections.find(
    c => c.chainId === counterpartyChain.chainId,
  )?.counterpartyChannelId;
  if (!counterpartyChannelId) {
    throw new Error(
      `Counterparty channel could not be found in registry for chain id: ${counterpartyChain.chainId}`,
    );
  }

  return counterpartyChannelId;
};

/**
 * Examples:
 * getRevisionNumberFromChainId("grand-1") returns 1n
 * getRevisionNumberFromChainId("osmo-test-5") returns 5n
 * getRevisionNumberFromChainId("penumbra-testnet-deimos-7") returns 7n
 */
export const parseRevisionNumberFromChainId = (chainId: string): bigint => {
  const match = chainId.match(/-(\d+)$/);
  if (match?.[1]) {
    return BigInt(match[1]);
  } else {
    throw new Error(`No revision number found within chain id: ${chainId}`);
  }
};

// Get timeout from penumbra chain blocks
const getTimeout = async (chainId: string) => {
  const { syncInfo } = await tendermintClient.getStatus({});
  const height = syncInfo?.latestBlockHeight;
  if (height === undefined) {
    throw new Error('Could not retrieve latest block height from Tendermint');
  }

  const timeoutHeight = {
    revisionNumber: parseRevisionNumberFromChainId(chainId),
    // We don't know the average block times for the counterparty chain, so just putting in the Penumbra average
    revisionHeight: height + BLOCKS_PER_HOUR * 3n,
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
  const isNotValidAmount = Boolean(coin) && Boolean(amount) && (inputAmountTooBig || numberTooLow);

  return {
    amountErr: isNotValidAmount,
    // Testnet coins don't seem to have assetType field. Checking manually for ibc address first.
    isUnsupportedAsset:
      coin && (isIbcAsset(coin.raw.denom) || (coin.assetType && coin.assetType !== 'sdk.coin')),
  };
};

export const ibcInSelector = (state: AllSlices) => state.ibcIn;
