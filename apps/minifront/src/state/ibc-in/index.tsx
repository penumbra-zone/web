import { ChainInfo } from '../../components/ibc/deposit-manual/chain-dropdown';
import { CosmosAssetBalance } from '../../components/ibc/deposit-manual/hooks';
import { ChainWalletContext } from '@cosmos-kit/core';
import { AllSlices, SliceCreator } from '..';
import { getAddrByIndex } from '../../fetchers/address';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { Toast } from '@penumbra-zone/ui-deprecated/lib/toast/toast';
import { shorten } from '@penumbra-zone/types/string';
import { calculateFee, GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { chains } from 'chain-registry';
import { getChainId } from '../../fetchers/chain-id';
import { augmentToAsset, fromDisplayAmount } from '../../components/ibc/deposit-manual/asset-utils';
import { cosmos, ibc } from 'osmo-query';
import { chainRegistryClient } from '../../fetchers/registry';
import { BLOCKS_PER_HOUR } from '../constants';
import { currentTimePlusTwoDaysRounded } from '../ibc-out';
import { EncodeObject } from '@cosmjs/proto-signing';
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx';
import { parseRevisionNumberFromChainId } from './parse-revision-number-from-chain-id';
import { penumbra } from '../../penumbra.ts';
import { TendermintProxyService, ViewService } from '@penumbra-zone/protobuf';
import { TransparentAddressRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

export interface IbcInSlice {
  selectedChain?: ChainInfo;
  setSelectedChain: (chain?: ChainInfo) => void;
  coin?: CosmosAssetBalance;
  setCoin: (coin?: CosmosAssetBalance) => void;
  amount?: string;
  setAmount: (amount?: string) => void;
  account: number;
  address?: string;
  setAccount: (account: number) => void;
  setAddress: () => Promise<void>;
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
    account: 0,
    address: undefined,
    setAddress: async () => {
      const { selectedChain, account } = get().ibcIn;
      const penumbraAddress = await getPenumbraAddress(account, selectedChain?.chainId);
      if (penumbraAddress) {
        set(state => {
          state.ibcIn.address = penumbraAddress;
        });
      }
    },
    setAccount: (account: number) => {
      set(state => {
        state.ibcIn.account = account;
      });
      void get().ibcIn.setAddress();
    },
    issueTx: async (getClient, address) => {
      const toast = new Toast();
      try {
        toast.loading().message('Issuing IBC transaction').render();

        if (!address) {
          throw new Error('Address not selected');
        }
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
  if (!chainId) {
    return undefined;
  }

  // They come in the format of "https://mintscan.io/noble-testnet/txs/${txHash}"
  const txPage = chains.find(({ chain_id }) => chain_id === chainId)?.explorers?.[0]?.tx_page;
  if (!txPage) {
    return undefined;
  }

  // eslint-disable-next-line no-template-curly-in-string -- Intended template string
  return txPage.replace('${txHash}', txHash);
};

export const getPenumbraAddress = async (
  account: number,
  chainId?: string,
): Promise<string | undefined> => {
  if (!chainId) {
    return undefined;
  }
  const receiverAddress = await getAddrByIndex(account, true);
  return bech32mAddress(receiverAddress);
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
  if (!feeToken) {
    throw new Error(`Fee token not found in registry for ${chainId}`);
  }
  if (!avgGasPrice) {
    throw new Error(`Average gas price not found for ${chainId}`);
  }

  const estimatedGas = await client.simulate(signerAddress, [message], '');
  const gasLimit = Math.round(estimatedGas * 1.5); // Give some padding to the limit due to fluctuations
  const gasPrice = GasPrice.fromString(`${feeToken.average_gas_price}${feeToken.denom}`); // e.g. 132uosmo
  return calculateFee(gasLimit, gasPrice);
};

async function execute(
  slice: IbcInSlice,
  sender: string,
  getStargateClient: ChainWalletContext['getSigningStargateClient'],
) {
  const { selectedChain, coin, amount, account } = slice;

  if (!coin) {
    throw new Error('No token is selected');
  }
  if (!amount) {
    throw new Error('Amount has not been entered');
  }
  if (!selectedChain) {
    throw new Error('No chain has been selected');
  }

  const penumbraChainId = await getChainId();
  if (!penumbraChainId) {
    throw new Error('Penumbra chain id could not be retrieved');
  }

  let penumbraAddress = await getPenumbraAddress(account, selectedChain.chainId);
  if (!penumbraAddress) {
    throw new Error('Penumbra address not available');
  }

  const { timeoutHeight, timeoutTimestamp } = await getTimeout(penumbraChainId);
  const assetMetadata = augmentToAsset(coin.raw.denom, selectedChain.chainName);

  const transferToken = fromDisplayAmount(assetMetadata, coin.displayDenom, amount);

  const { address: t_addr, encoding: encoding } = await penumbra
    .service(ViewService)
    .transparentAddress(new TransparentAddressRequest({}));
  if (!t_addr) {
    throw new Error('Error with generating IBC transparent address');
  }

  // Temporary: detect USDC Noble inbound transfers, and use transparent (t-addr) encoding
  // to ensure bech32m encoding compatibility.
  if (
    transferToken.denom.includes('uusdc') &&
    (selectedChain.chainId === 'noble-1' || selectedChain.chainId === 'grand-1')
  ) {
    // Set the reciever address to the t-addr encoding.
    penumbraAddress = encoding;
  }

  const params: MsgTransfer = {
    sourcePort: 'transfer',
    sourceChannel: await getCounterpartyChannelId(selectedChain, penumbraChainId),
    sender,
    receiver: penumbraAddress,
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
    signerAddress: sender,
    message: ibcTransferMsg,
  });

  const signedTx = await client.sign(sender, [ibcTransferMsg], fee, '');
  return await client.broadcastTx(cosmos.tx.v1beta1.TxRaw.encode(signedTx).finish());
}

const getCounterpartyChannelId = async (
  counterpartyChain: ChainInfo,
  penumbraChainId: string,
): Promise<string> => {
  const registry = await chainRegistryClient.remote.get(penumbraChainId);

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

// Get timeout from penumbra chain blocks
const getTimeout = async (chainId: string) => {
  const { syncInfo } = await penumbra.service(TendermintProxyService).getStatus({});
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
      coin &&
      !coin.isPenumbra &&
      (isIbcAsset(coin.raw.denom) || (coin.assetType && coin.assetType !== 'sdk.coin')),
  };
};

export const ibcInSelector = (state: AllSlices) => state.ibcIn;
