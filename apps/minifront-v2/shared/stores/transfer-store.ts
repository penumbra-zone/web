import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from './root-store';
import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Fee, FeeTier_Tier } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import { Metadata, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { MemoPlaintext } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import {
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import { getAddress, getAddressIndex } from '@penumbra-zone/getters/address-view';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';
import { isAddress, bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { BigNumber } from 'bignumber.js';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '../lib/penumbra';

export interface SendState {
  recipient: string;
  amount: string;
  memo: string;
  selectedAsset?: BalancesResponse;
  feeTier: FeeTier_Tier;
  fee?: Fee;
  feeAssetMetadata?: Metadata;
  isLoading: boolean;
  isFeeLoading: boolean;
  error?: string;
}

export interface ReceiveState {
  selectedAccountIndex: number;
  accountAddress: string;
  ibcDepositEnabled: boolean;
}

export class TransferStore {
  private rootStore: RootStore;

  // Send state
  sendState: SendState = {
    recipient: '',
    amount: '',
    memo: '',
    feeTier: FeeTier_Tier.LOW,
    isLoading: false,
    isFeeLoading: false,
  };

  // Receive state
  receiveState: ReceiveState = {
    selectedAccountIndex: 0,
    accountAddress: '',
    ibcDepositEnabled: false,
  };

  // UI state
  activeTab: 'send' | 'receive' = 'send';

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // Send actions
  setSendRecipient(recipient: string) {
    this.sendState.recipient = recipient;
    this.refreshFee();
  }

  setSendAmount(amount: string) {
    // Prevent negative amounts
    if (Number(amount) < 0) return;
    this.sendState.amount = amount;
    this.refreshFee();
  }

  setSendMemo(memo: string) {
    this.sendState.memo = memo;
  }

  setSelectedAsset(asset?: BalancesResponse) {
    this.sendState.selectedAsset = asset;
    this.refreshFee();
  }

  setFeeTier(tier: FeeTier_Tier) {
    this.sendState.feeTier = tier;
    this.refreshFee();
  }

  estimateFee() {
    this.refreshFee();
  }

  // Receive actions
  setSelectedAccountIndex(index: number) {
    this.receiveState.selectedAccountIndex = index;
    this.loadAccountAddress();
  }

  toggleIbcDeposit() {
    this.receiveState.ibcDepositEnabled = !this.receiveState.ibcDepositEnabled;
    // Reload address when toggle changes
    this.loadAccountAddress();
  }

  setActiveTab(tab: 'send' | 'receive') {
    this.activeTab = tab;
  }

  // Computed values
  get sendValidation() {
    const { recipient, memo } = this.sendState;

    return {
      recipientError: Boolean(recipient) && !isAddress(recipient),
      amountError: this.isAmountMoreThanBalance(),
      exponentError: this.hasIncorrectDecimal(),
      // Memo cannot exceed 512 bytes, return address uses 80 bytes
      memoError: new TextEncoder().encode(memo).length > 432,
    };
  }

  get canSend() {
    const { recipient, amount, selectedAsset } = this.sendState;
    const validation = this.sendValidation;

    return (
      Boolean(recipient) &&
      Boolean(Number(amount)) &&
      Boolean(selectedAsset) &&
      !validation.recipientError &&
      !validation.amountError &&
      !validation.exponentError &&
      !validation.memoError &&
      !this.sendState.isLoading
    );
  }

  // Helper methods
  private isAmountMoreThanBalance(): boolean {
    const { selectedAsset, amount } = this.sendState;
    if (!selectedAsset || !amount) return false;

    const balance = selectedAsset.balanceView?.valueView?.value?.amount;
    if (!balance) return false;

    const exponent = getDisplayDenomExponentFromValueView.optional(selectedAsset.balanceView);
    const amountInBaseUnit = toBaseUnit(BigNumber(amount), exponent);

    // toBaseUnit returns a LoHi object, we need to compare as BigNumber
    const amountBigNumber = new BigNumber(amountInBaseUnit.lo.toString()).plus(
      new BigNumber((amountInBaseUnit.hi || 0).toString()).shiftedBy(32),
    );

    // Convert balance to BigNumber for comparison
    const balanceBigNumber = new BigNumber(balance.lo.toString()).plus(
      new BigNumber(balance.hi.toString()).shiftedBy(32),
    );

    return amountBigNumber.gt(balanceBigNumber);
  }

  private hasIncorrectDecimal(): boolean {
    const { selectedAsset, amount } = this.sendState;
    if (!selectedAsset || !amount) return false;

    const exponent = getDisplayDenomExponentFromValueView.optional(selectedAsset.balanceView);
    const decimals = amount.split('.')[1]?.length ?? 0;

    return decimals > (exponent ?? 0);
  }

  private async refreshFee() {
    const { amount, recipient, selectedAsset, feeTier } = this.sendState;

    // Always show loading state when attempting fee calculation
    runInAction(() => {
      this.sendState.isFeeLoading = true;
    });

    try {
      // Check if penumbra service is available
      if (!penumbra?.service) {
        console.log('TransferStore: Penumbra service not available');
        this.resetFee();
        return;
      }

      let request: TransactionPlannerRequest;

      // Try to build a transaction request for fee estimation
      if (amount && recipient && selectedAsset && isAddress(recipient)) {
        // Use real transaction data when all fields are complete
        console.log('TransferStore: Using real transaction data for fee estimation');
        request = await this.buildTransactionRequest();
      } else {
        // Try to estimate with available data or dummy data
        console.log('TransferStore: Using dummy data for fee estimation');
        const estimationAsset = selectedAsset || this.getDummyAsset();
        const estimationAmount = amount || '1';
        const estimationRecipient =
          recipient && isAddress(recipient) ? recipient : await this.getDummyAddress();

        if (!estimationAsset || !estimationRecipient) {
          console.log('TransferStore: No assets or addresses available for fee estimation');
          this.resetFee();
          return;
        }

        console.log('TransferStore: Estimation params:', {
          asset: getMetadata.optional(estimationAsset.balanceView)?.symbol || 'unknown',
          amount: estimationAmount,
          hasRecipient: !!estimationRecipient,
        });

        request = await this.buildDummyTransactionRequest(
          estimationAsset,
          estimationAmount,
          estimationRecipient,
          feeTier,
        );
      }

      console.log('TransferStore: Planning transaction for fee estimation...');
      const { plan } = await penumbra.service(ViewService).transactionPlanner(request);

      if (!plan) {
        console.log('TransferStore: No plan returned from transaction planner');
        this.resetFee();
        return;
      }

      const fee = plan.transactionParameters?.fee;
      console.log('TransferStore: Fee calculated:', fee);

      // Get fee asset metadata
      let feeAssetMetadata: Metadata | undefined;

      // If fee has no assetId, use staking token (UM) as default
      if (!fee?.assetId?.inner) {
        // Find UM token in assets
        feeAssetMetadata = this.rootStore.assetsStore.allAssets.find(
          asset => asset.symbol === 'UM' || asset.display === 'penumbra',
        );
        console.log('TransferStore: Using default UM token for fee metadata');
      } else {
        const assetIdBase64 = uint8ArrayToBase64(fee.assetId.inner);
        // Search through all assets to find matching metadata
        for (const asset of this.rootStore.assetsStore.allAssets) {
          if (asset.penumbraAssetId?.inner) {
            const currentAssetIdBase64 = uint8ArrayToBase64(asset.penumbraAssetId.inner);
            if (currentAssetIdBase64 === assetIdBase64) {
              feeAssetMetadata = asset;
              break;
            }
          }
        }
        console.log('TransferStore: Found fee asset metadata:', feeAssetMetadata?.symbol);
      }

      runInAction(() => {
        this.sendState.fee = fee;
        this.sendState.feeAssetMetadata = feeAssetMetadata;
        this.sendState.isFeeLoading = false;
      });

      console.log('TransferStore: Fee estimation completed successfully');
    } catch (error) {
      console.error('TransferStore: Error calculating fee:', error);
      this.resetFee();
    }
  }

  private resetFee() {
    runInAction(() => {
      this.sendState.fee = undefined;
      this.sendState.feeAssetMetadata = undefined;
      this.sendState.isFeeLoading = false;
    });
  }

  private getDummyAsset(): BalancesResponse | undefined {
    // Return first available balance response as dummy
    return this.rootStore.balancesStore.balancesResponses[0];
  }

  private async getDummyAddress(): Promise<string> {
    // First try to use an existing balance address
    const firstBalance = this.rootStore.balancesStore.balancesResponses[0];
    if (firstBalance?.accountAddress) {
      return bech32mAddress(getAddress(firstBalance.accountAddress));
    }

    // If no balances, generate a dummy address using account 0
    try {
      const response = await penumbra.service(ViewService).addressByIndex({
        addressIndex: { account: 0 },
      });

      if (response.address) {
        return bech32mAddress(response.address);
      }
    } catch (error) {
      console.error('TransferStore: Error generating dummy address:', error);
    }

    return '';
  }

  private async buildDummyTransactionRequest(
    asset: BalancesResponse,
    amount: string,
    recipient: string,
    feeTier: FeeTier_Tier,
  ): Promise<TransactionPlannerRequest> {
    const value = new Value({
      amount: toBaseUnit(
        BigNumber(amount),
        getDisplayDenomExponentFromValueView.optional(asset.balanceView),
      ),
      assetId: getAssetIdFromValueView(asset.balanceView),
    });

    return new TransactionPlannerRequest({
      outputs: [
        {
          address: new Address({ altBech32m: recipient }),
          value,
        },
      ],
      source: getAddressIndex(asset.accountAddress),
      feeMode: {
        case: 'autoFee',
        value: { feeTier },
      },
      memo: new MemoPlaintext({
        returnAddress: getAddress(asset.accountAddress),
        text: 'Fee estimation',
      }),
    });
  }

  private async buildTransactionRequest(): Promise<TransactionPlannerRequest> {
    const { amount, feeTier, recipient, selectedAsset, memo } = this.sendState;

    const value = new Value({
      amount: toBaseUnit(
        BigNumber(amount),
        getDisplayDenomExponentFromValueView.optional(selectedAsset?.balanceView),
      ),
      assetId: getAssetIdFromValueView(selectedAsset?.balanceView),
    });

    return new TransactionPlannerRequest({
      outputs: [
        {
          address: new Address({ altBech32m: recipient }),
          value,
        },
      ],
      source: getAddressIndex(selectedAsset?.accountAddress),
      feeMode: {
        case: 'autoFee',
        value: { feeTier },
      },
      memo: new MemoPlaintext({
        returnAddress: getAddress(selectedAsset?.accountAddress),
        text: memo,
      }),
    });
  }

  async sendTransaction() {
    if (!this.canSend) return;

    runInAction(() => {
      this.sendState.isLoading = true;
      this.sendState.error = undefined;
    });

    try {
      const request = await this.buildTransactionRequest();

      // Plan the transaction
      const { plan } = await penumbra.service(ViewService).transactionPlanner(request);
      if (!plan) throw new Error('No plan in planner response');

      // Build the transaction with user authorization
      const buildStream = penumbra
        .service(ViewService)
        .authorizeAndBuild({ transactionPlan: plan });
      let transaction;

      for await (const { status } of buildStream) {
        if (status.case === 'complete' && status.value.transaction) {
          transaction = status.value.transaction;
          break;
        }
      }

      if (!transaction) throw new Error('Failed to build transaction');

      // Broadcast the transaction
      const broadcastStream = penumbra.service(ViewService).broadcastTransaction({
        transaction,
        awaitDetection: true,
      });

      for await (const { status } of broadcastStream) {
        if (status.case === 'confirmed') {
          // Transaction confirmed
          break;
        }
      }

      // Reset form after successful send
      runInAction(() => {
        this.sendState.amount = '';
        this.sendState.memo = '';
        this.sendState.isLoading = false;
      });

      // Refresh balances
      await this.rootStore.balancesStore.loadBalances();
    } catch (error) {
      runInAction(() => {
        this.sendState.error = error instanceof Error ? error.message : 'Transaction failed';
        this.sendState.isLoading = false;
      });
    }
  }

  private async loadAccountAddress() {
    try {
      if (this.receiveState.ibcDepositEnabled) {
        // Generate randomized IBC deposit address
        const response = await penumbra.service(ViewService).ephemeralAddress({
          addressIndex: { account: this.receiveState.selectedAccountIndex },
        });

        if (response.address) {
          runInAction(() => {
            this.receiveState.accountAddress = bech32mAddress(response.address!);
          });
        }
      } else {
        // Get regular address for the selected account index
        const response = await penumbra.service(ViewService).addressByIndex({
          addressIndex: { account: this.receiveState.selectedAccountIndex },
        });

        if (response.address) {
          runInAction(() => {
            this.receiveState.accountAddress = bech32mAddress(response.address!);
          });
        }
      }
    } catch (error) {
      console.error('Error loading account address:', error);
    }
  }

  async copyAddress() {
    if (!this.receiveState.accountAddress) return;

    try {
      await navigator.clipboard.writeText(this.receiveState.accountAddress);
    } catch (error) {
      console.error('Error copying address:', error);
    }
  }

  async initialize() {
    // Load initial account address for receive tab
    await this.loadAccountAddress();
  }

  dispose() {
    // Cleanup if needed
  }
}
