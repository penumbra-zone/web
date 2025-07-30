import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from './root-store';
import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { chains } from 'chain-registry';
import { bech32, bech32m } from 'bech32';
import { BigNumber } from 'bignumber.js';
import {
  ViewService,
  IbcChannelService,
  IbcConnectionService,
  IbcClientService,
} from '@penumbra-zone/protobuf';
import { penumbra } from '../lib/penumbra';
import {
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';
import { Height } from '@penumbra-zone/protobuf/ibc/core/client/v1/client_pb';
import { ClientState } from '@penumbra-zone/protobuf/ibc/lightclients/tendermint/v1/tendermint_pb';

export interface ChainInfo {
  chainId: string;
  chainName: string;
  displayName: string;
  addressPrefix: string;
  channelId: string;
  icon?: string;
}

const APPROX_BLOCK_DURATION_MS = 5_500n;
const MINUTE_MS = 60_000n;
const BLOCKS_PER_MINUTE = MINUTE_MS / APPROX_BLOCK_DURATION_MS;
const BLOCKS_PER_HOUR = BLOCKS_PER_MINUTE * 60n;

const tenMinsMs = 1000 * 60 * 10;
const twoDaysMs = 1000 * 60 * 60 * 24 * 2;

const currentTimePlusTwoDaysRounded = (currentTimeMs: number): bigint => {
  const twoDaysFromNowMs = currentTimeMs + twoDaysMs;
  const roundedTimeoutMs = twoDaysFromNowMs + tenMinsMs - (twoDaysFromNowMs % tenMinsMs);
  return BigInt(roundedTimeoutMs) * 1_000_000n;
};

export interface WithdrawState {
  selectedChain?: ChainInfo;
  selectedAsset?: BalancesResponse;
  amount: string;
  destinationAddress: string;
  isLoading: boolean;
  error?: string;
}

export class WithdrawStore {
  private rootStore: RootStore;

  withdrawState: WithdrawState;
  availableChains: ChainInfo[];

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    this.withdrawState = {
      amount: '',
      destinationAddress: '',
      isLoading: false,
    };
    this.availableChains = [];

    makeAutoObservable(this);
  }

  setSelectedChain(chain?: ChainInfo) {
    runInAction(() => {
      this.withdrawState = {
        ...this.withdrawState,
        selectedChain: chain,
        selectedAsset: undefined,
        amount: '',
        destinationAddress: '',
      };
    });
  }

  setSelectedAsset(asset?: BalancesResponse) {
    runInAction(() => {
      this.withdrawState = {
        ...this.withdrawState,
        selectedAsset: asset,
        amount: '',
      };
    });
  }

  setAmount(amount: string) {
    if (Number(amount) < 0) {
      return;
    }

    if (!this.withdrawState) {
      console.error('WithdrawStore.withdrawState is undefined in setAmount');
      return;
    }

    runInAction(() => {
      this.withdrawState = {
        ...this.withdrawState,
        amount,
      };
    });
  }

  setMaxAmount() {
    const { selectedAsset } = this.withdrawState;
    if (selectedAsset?.balanceView?.valueView?.case === 'knownAssetId') {
      const displayAmount = selectedAsset.balanceView.valueView.value.amount?.lo?.toString() || '0';
      const exponent = getDisplayDenomExponentFromValueView(selectedAsset.balanceView);
      const maxAmount = new BigNumber(displayAmount)
        .dividedBy(new BigNumber(10).pow(exponent))
        .toString();
      this.setAmount(maxAmount);
    }
  }

  setDestinationAddress(address: string) {
    if (!this.withdrawState) {
      console.error('WithdrawStore.withdrawState is undefined in setDestinationAddress');
      return;
    }

    runInAction(() => {
      this.withdrawState = {
        ...this.withdrawState,
        destinationAddress: address,
      };
    });
  }

  get validation() {
    const { selectedChain, selectedAsset } = this.withdrawState;

    return {
      chainError: !selectedChain,
      assetError: !selectedAsset,
      amountError: this.isAmountInvalid(),
      addressError: this.isAddressInvalid(),
      balanceError: this.isAmountMoreThanBalance(),
      decimalError: this.hasIncorrectDecimal(),
    };
  }

  get canWithdraw() {
    const { selectedChain, selectedAsset, amount, destinationAddress } = this.withdrawState;
    const validation = this.validation;

    return (
      Boolean(selectedChain) &&
      Boolean(selectedAsset) &&
      Boolean(Number(amount)) &&
      Boolean(destinationAddress.trim()) &&
      !validation.amountError &&
      !validation.addressError &&
      !validation.balanceError &&
      !validation.decimalError &&
      !this.withdrawState.isLoading
    );
  }

  private isAmountInvalid(): boolean {
    const { amount } = this.withdrawState;
    if (!amount.trim()) {
      return false;
    }

    const numericAmount = parseFloat(amount);
    return isNaN(numericAmount) || numericAmount <= 0;
  }

  private isAmountMoreThanBalance(): boolean {
    const { selectedAsset, amount } = this.withdrawState;
    if (
      !selectedAsset ||
      !amount ||
      selectedAsset.balanceView?.valueView?.case !== 'knownAssetId'
    ) {
      return false;
    }

    const numericAmount = parseFloat(amount);
    const displayAmount = selectedAsset.balanceView.valueView.value.amount?.lo?.toString() || '0';
    const exponent = getDisplayDenomExponentFromValueView(selectedAsset.balanceView);
    const availableAmount = new BigNumber(displayAmount)
      .dividedBy(new BigNumber(10).pow(exponent))
      .toNumber();

    return numericAmount > availableAmount;
  }

  private hasIncorrectDecimal(): boolean {
    const { selectedAsset, amount } = this.withdrawState;
    if (!selectedAsset || !amount) {
      return false;
    }

    const exponent = getDisplayDenomExponentFromValueView(selectedAsset.balanceView);
    const decimals = amount.includes('.') ? (amount.split('.')[1]?.length ?? 0) : 0;

    return decimals > exponent;
  }

  private isAddressInvalid(): boolean {
    const { selectedChain, destinationAddress } = this.withdrawState;
    if (!selectedChain || !destinationAddress.trim()) {
      return false;
    }

    try {
      const { prefix, words } =
        bech32.decodeUnsafe(destinationAddress, Infinity) ??
        bech32m.decodeUnsafe(destinationAddress, Infinity) ??
        {};

      return !words || prefix !== selectedChain.addressPrefix;
    } catch {
      return true;
    }
  }

  async loadAvailableChains() {
    try {
      const chainId = this.rootStore.appParametersStore.chainId;
      if (!chainId) {
        console.warn('Chain ID not available yet, will retry when available');
        // Don't set fallback chains, just wait for chainId
        return;
      }

      const registryClient = new ChainRegistryClient();
      const registry = await registryClient.remote.get(chainId);
      const ibcConnections = registry.ibcConnections;

      // Accept ALL chains from the registry that have valid IBC connections
      // No filtering - let the cosmos-kit provider handle wallet support
      const registryChains: ChainInfo[] = ibcConnections
        .map(chain => {
          const chainData = chain as any;
          const chainRegistryInfo = chains.find(c => c.chain_id === chainData.chainId);

          // Use consistent naming logic across both deposit and withdraw stores
          const chainName =
            chainRegistryInfo?.chain_name || chainData.chainId.split('-')[0] || chainData.chainId;
          const displayName =
            chainRegistryInfo?.pretty_name ||
            (chainRegistryInfo?.chain_name
              ? chainRegistryInfo.chain_name.charAt(0).toUpperCase() +
                chainRegistryInfo.chain_name.slice(1)
              : chainData.chainId);

          return {
            chainId: chainData.chainId,
            chainName: chainName,
            displayName: displayName,
            addressPrefix:
              chainRegistryInfo?.bech32_prefix || chainData.chainId.split('-')[0] || 'cosmos',
            channelId: chainData.channelId,
            icon:
              chainRegistryInfo?.images?.[0]?.png ||
              `https://raw.githubusercontent.com/cosmos/chain-registry/master/${chainName}/images/${chainName}.png`,
          };
        })
        .filter(chain => {
          // Only basic validation - has required fields
          const isValid = chain.chainId && chain.channelId && chain.addressPrefix;
          if (!isValid) {
            console.warn('Skipping invalid chain:', chain);
          }
          return isValid;
        });

      runInAction(() => {
        this.availableChains = registryChains;
      });
    } catch (error) {
      console.error('Failed to load available chains from registry:', error);
      // Don't set fallback - let the error surface so we can debug
      runInAction(() => {
        this.availableChains = [];
      });
    }
  }

  // Removed getFallbackChains - we now rely entirely on the registry
  // This prevents artificial limitations on supported chains

  private async getTimeout(
    channelId: string,
  ): Promise<{ timeoutTime: bigint; timeoutHeight: Height }> {
    try {
      const { channel } = await penumbra.service(IbcChannelService).channel({
        portId: 'transfer',
        channelId,
      });

      if (!channel) {
        throw new Error(`Channel not found for channelId: ${channelId}`);
      }

      const connectionId = channel.connectionHops[0];
      if (!connectionId) {
        throw new Error('No connectionId found in channel');
      }

      const { connection } = await penumbra.service(IbcConnectionService).connection({
        connectionId,
      });

      const clientId = connection?.clientId;
      if (!clientId) {
        throw new Error('No clientId found in connection');
      }

      const { clientState: anyClientState } = await penumbra
        .service(IbcClientService)
        .clientState({ clientId });

      if (!anyClientState) {
        throw new Error(`Could not get state for client id ${clientId}`);
      }

      const clientState = new ClientState();
      const success = anyClientState.unpackTo(clientState);
      if (!success) {
        throw new Error(`Error unpacking client state for client id ${clientId}`);
      }

      if (!clientState.latestHeight) {
        throw new Error(`Latest height not provided in client state for ${clientState.chainId}`);
      }

      return {
        timeoutTime: currentTimePlusTwoDaysRounded(Date.now()),
        timeoutHeight: new Height({
          revisionHeight: clientState.latestHeight.revisionHeight + BLOCKS_PER_HOUR * 3n,
          revisionNumber: clientState.latestHeight.revisionNumber,
        }),
      };
    } catch (error) {
      console.error('Error getting timeout, using fallback:', error);
      return {
        timeoutTime: currentTimePlusTwoDaysRounded(Date.now()),
        timeoutHeight: new Height({
          revisionHeight: BigInt(Math.floor(Date.now() / 1000) + 3600),
          revisionNumber: 1n,
        }),
      };
    }
  }

  private async buildTransactionRequest(): Promise<TransactionPlannerRequest> {
    const { selectedChain, selectedAsset, amount, destinationAddress } = this.withdrawState;

    if (!selectedChain || !selectedAsset || !destinationAddress) {
      throw new Error('Missing required withdrawal information');
    }

    if (selectedAsset.balanceView?.valueView?.case !== 'knownAssetId') {
      throw new Error('Invalid asset selected');
    }

    const addressIndex = getAddressIndex(selectedAsset.accountAddress);

    // Normalise the randomizer: if it is all-zero but shorter than 12 bytes (e.g. Uint8Array(3)),
    // treat it as "not present" by setting an empty Uint8Array. The planner service
    // rejects non-empty randomizers with length ≠ 12.
    if (
      addressIndex &&
      addressIndex.randomizer &&
      addressIndex.randomizer.length > 0 &&
      addressIndex.randomizer.every(b => b === 0)
    ) {
      addressIndex.randomizer = new Uint8Array();
    }

    const { address: returnAddress } = await penumbra.service(ViewService).ephemeralAddress({
      addressIndex,
    });

    if (!returnAddress) {
      throw new Error('Error generating IBC return address');
    }

    const metadata = getMetadata(selectedAsset.balanceView);
    const exponent = getDisplayDenomExponentFromValueView(selectedAsset.balanceView);
    const baseAmount = toBaseUnit(BigNumber(amount), exponent);

    const denom = metadata.base;
    let channelId: string | undefined;

    if (denom.startsWith('transfer/')) {
      // IBC voucher coming *into* Penumbra – channel encoded in denom
      channelId = denom.split('/')[1];
    } else {
      // Native Penumbra asset – use the channel configured for the destination chain
      channelId = selectedChain.channelId;
    }

    if (!channelId) {
      throw new Error(
        `Could not determine channel ID for withdrawal. Asset denom: ${denom}, destination chain: ${selectedChain.chainName}`,
      );
    }

    const { timeoutHeight, timeoutTime } = await this.getTimeout(channelId);

    const withdrawalData = {
      amount: baseAmount,
      denom: { denom },
      destinationChainAddress: destinationAddress,
      returnAddress,
      timeoutHeight,
      timeoutTime,
      sourceChannel: channelId,
    };

    return new TransactionPlannerRequest({
      ics20Withdrawals: [withdrawalData],
      source: addressIndex,
    });
  }

  async executeWithdrawal() {
    if (!this.canWithdraw) {
      return;
    }

    runInAction(() => {
      this.withdrawState = {
        ...this.withdrawState,
        isLoading: true,
        error: undefined,
      };
    });

    try {
      const request = await this.buildTransactionRequest();

      // Use the toast-enabled transaction helper
      const { planBuildBroadcast } = await import('../services/transaction');
      await planBuildBroadcast('ics20Withdrawal', request);

      runInAction(() => {
        this.withdrawState = {
          ...this.withdrawState,
          amount: '',
          destinationAddress: '',
          isLoading: false,
        };
      });

      await this.rootStore.balancesStore.loadBalances();

      // Reload transactions so UI (Recent Shielding Activity) reflects the new withdrawal
      void this.rootStore.transactionsStore.loadTransactions();
    } catch (error) {
      console.error('🔍 Full withdrawal error details:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorCode: (error as any)?.code,
        errorDetails: (error as any)?.details,
        withdrawalParams: {
          chainName: this.withdrawState.selectedChain?.chainName,
          destinationAddress: this.withdrawState.destinationAddress,
          amount: this.withdrawState.amount,
        },
      });

      // Only set error state if it's not a user denial (toast handles those)
      const { userDeniedTransaction } = await import('../services/transaction');
      if (!userDeniedTransaction(error)) {
        runInAction(() => {
          this.withdrawState = {
            ...this.withdrawState,
            error: error instanceof Error ? error.message : 'Withdrawal failed',
          };
        });
      }
      runInAction(() => {
        this.withdrawState = {
          ...this.withdrawState,
          isLoading: false,
        };
      });
    }
  }

  async initialize() {
    await this.loadAvailableChains();
  }

  dispose() {
    // Cleanup subscriptions if any
  }
}
