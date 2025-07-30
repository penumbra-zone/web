/**
 * StakingStore - Manages staking-related state and operations
 *
 * This store handles:
 * - Validator information and delegation tokens
 * - Unbonding and claimable amounts
 * - Delegation and undelegation transactions
 * - Account-specific staking data
 */

import { makeAutoObservable, runInAction } from 'mobx';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValidatorInfo } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import {
  TransactionPlannerRequest,
  BalancesResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  getAmount,
  getDisplayDenomExponentFromValueView,
  getAssetIdFromValueView,
} from '@penumbra-zone/getters/value-view';
import {
  getRateData,
  getIdentityKeyFromValidatorInfo,
} from '@penumbra-zone/getters/validator-info';
import {
  getMetadataFromBalancesResponse,
  getBalanceView,
  getAddressIndex,
} from '@penumbra-zone/getters/balances-response';
import { getDisplay, getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { getVotingPowerByValidatorInfo } from '@penumbra-zone/types/staking';
import { RootStore } from './root-store';
import { toBaseUnit, fromBaseUnit } from '@penumbra-zone/types/lo-hi';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import BigNumber from 'bignumber.js';
import { penumbra } from '@/shared/lib/penumbra';
import { SctService, StakeService, AppService } from '@penumbra-zone/protobuf';
import { Any } from '@bufbuild/protobuf';
import {
  getValidatorIdentityKeyFromValueView,
  getDisplayDenomFromView,
} from '@penumbra-zone/getters/value-view';
import { getValidatorInfo } from '@penumbra-zone/getters/validator-info-response';
import { getBondingState } from '@penumbra-zone/getters/validator-status';
import {
  BondingState,
  BondingState_BondingStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { TransactionPlannerRequest_UndelegateClaim } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

/**
 * Find the unbonding start height, for penalty calculation.
 * Parses the value's denom for its embedded unbonding start height.
 */
const parseUnbondingStartHeight = (unbondingValue: ValueView): bigint => {
  const unbondingMatch = assetPatterns.unbondingToken.capture(
    getDisplayDenomFromView(unbondingValue),
  );
  if (!unbondingMatch?.startAt) {
    throw TypeError('Value is not an unbonding token', { cause: unbondingValue });
  }

  return BigInt(unbondingMatch.startAt);
};

/**
 * Find a reasonable unbonding end height, for penalty calculation.
 * The unbonding may be old enough that the validator has since transitioned
 * states, so the chosen end height depends on the validator's present state.
 */
const chooseUnbondingEndHeight = ({
  currentHeight,
  appUnbondingDelay,
  startHeight,
  validatorBondingState,
}: {
  currentHeight: bigint;
  appUnbondingDelay: bigint;
  startHeight: bigint;
  validatorBondingState: BondingState;
}) => {
  if (!validatorBondingState.state) {
    throw new ReferenceError('Validator bonding state must be available', {
      cause: validatorBondingState,
    });
  }
  const { state: validatorState, unbondsAtHeight: validatorHeight } = validatorBondingState;

  const appDelayHeight = startHeight + appUnbondingDelay;

  let endHeight: bigint;
  switch (validatorState) {
    case BondingState_BondingStateEnum.BONDED:
      endHeight = appDelayHeight;
      break;
    case BondingState_BondingStateEnum.UNBONDING:
      if (validatorHeight > startHeight) {
        endHeight =
          // if the validator height exceeds the app delay height
          validatorHeight > appDelayHeight
            ? appDelayHeight //  clamp to the app delay height
            : validatorHeight;
      } else {
        endHeight = currentHeight;
      }
      break;
    case BondingState_BondingStateEnum.UNBONDED:
      endHeight = currentHeight;
      break;
  }

  return (
    // if the calculated height is in the future
    endHeight > currentHeight
      ? currentHeight // clamp to the current height
      : endHeight
  );
};

/**
 * Assemble an undelegation claim for a specific unbonding token
 */
const assembleUndelegationClaim = async ({
  currentHeight,
  appUnbondingDelay,
  unbondingValue,
}: {
  currentHeight: bigint;
  appUnbondingDelay: bigint;
  unbondingValue: ValueView;
}): Promise<TransactionPlannerRequest_UndelegateClaim> => {
  const sctClient = penumbra.service(SctService);
  const stakeClient = penumbra.service(StakeService);

  const identityKey = getValidatorIdentityKeyFromValueView(unbondingValue);

  const { status: validatorStatus } = await stakeClient.validatorStatus({ identityKey });

  const startHeight = parseUnbondingStartHeight(unbondingValue);
  const { epoch: startEpoch } = await sctClient.epochByHeight({ height: startHeight });

  const endHeight = chooseUnbondingEndHeight({
    currentHeight,
    appUnbondingDelay,
    startHeight,
    validatorBondingState: getBondingState(validatorStatus),
  });
  const { epoch: endEpoch } = await sctClient.epochByHeight({ height: endHeight });

  if (!startEpoch || !endEpoch) {
    throw new Error('Failed to identify an unbonding epoch range', {
      cause: { startHeight, endHeight },
    });
  }

  const { penalty } = await stakeClient.validatorPenalty({
    identityKey,
    startEpochIndex: startEpoch.index,
    endEpochIndex: endEpoch.index,
  });

  if (!penalty) {
    throw new Error('No penalty for unbonding from validator', {
      cause: {
        unbondingValue,
        startEpoch,
        endEpoch,
        validatorIdentity: identityKey,
        validatorStatus,
      },
    });
  }

  return new TransactionPlannerRequest_UndelegateClaim({
    validatorIdentity: identityKey,
    unbondingStartHeight: startHeight,
    unbondingAmount: getAmount(unbondingValue),
    penalty,
  });
};

export interface UnbondingTokensForAccount {
  claimable: {
    total: ValueView;
    tokens: ValueView[];
  };
  notYetClaimable: {
    total: ValueView;
    tokens: ValueView[];
  };
}

export type StakingAction = 'delegate' | 'undelegate' | undefined;

export class StakingStore {
  private rootStore: RootStore;
  private disposers: (() => void)[] = [];

  // Observables
  currentAccount = 0;
  delegationsByAccount = new Map<number, ValueView[]>();
  unbondingByAccount = new Map<number, UnbondingTokensForAccount>();
  availableValidators: ValidatorInfo[] = [];
  votingPowerByValidator = new Map<string, number>();

  // Dialog state
  action: StakingAction = undefined;
  actionValidator?: ValidatorInfo = undefined;
  amount = '';
  selectedBalancesResponse?: BalancesResponse = undefined;

  // Loading states
  loading = false;
  validatorsLoading = false;
  error?: string = undefined;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // Helper method to get staking token metadata
  private async getStakingTokenMetadata(): Promise<Metadata> {
    // Try to get from assets store first
    const nativeToken = this.rootStore.assetsStore.nativeToken;
    if (nativeToken) {
      return nativeToken;
    }

    // Fetch from assets stream if not cached
    try {
      for await (const response of this.rootStore.penumbraService.getAssetsStream()) {
        const metadata = response.denomMetadata;
        if (metadata && getDisplay.optional(metadata) === 'penumbra') {
          // Note: Cannot directly assign due to readonly, but we can store in local state
          return metadata;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch staking token metadata from stream:', error);
    }

    // Fallback to basic UM metadata if not available
    return new Metadata({
      display: 'penumbra',
      base: 'upenumbra',
      denomUnits: [
        { denom: 'upenumbra', exponent: 0 },
        { denom: 'penumbra', exponent: 6 },
      ],
      symbol: 'UM',
      name: 'Penumbra',
    });
  }

  // Computed properties
  get delegationsCurrent(): ValueView[] {
    return this.delegationsByAccount.get(this.currentAccount) || [];
  }

  get stakingTokenMetadata(): Metadata {
    // Get the native UM token metadata from the assets store, with fallback
    return (
      this.rootStore.assetsStore.nativeToken ||
      new Metadata({
        display: 'penumbra',
        base: 'upenumbra',
        denomUnits: [
          { denom: 'upenumbra', exponent: 0 },
          { denom: 'penumbra', exponent: 6 },
        ],
        symbol: 'UM',
        name: 'Penumbra',
      })
    );
  }

  get validatorsLoadingError(): string | undefined {
    return this.error;
  }

  get balanceUm(): string {
    // Find UM balance from current account balances
    const currentAccountBalances = this.rootStore.balancesStore.balancesByAccount.find(
      acc => acc.account === this.currentAccount,
    );
    if (!currentAccountBalances) return '0';

    // Find UM balance
    const umBalance = currentAccountBalances.balances.find((balance: any) => {
      const metadata = getMetadataFromBalancesResponse.optional(balance);
      return metadata?.symbol === 'UM';
    });

    if (!umBalance) return '0';

    const balanceView = getBalanceView(umBalance);
    if (!balanceView) return '0';

    const amount = getAmount(balanceView);
    if (!amount) return '0';

    // Simple conversion - assume 6 decimal places for UM
    return fromBaseUnit(amount.lo, amount.hi, 6).toFixed(6);
  }

  get availableToDelegate(): string {
    return this.balanceUm;
  }

  get unbondingCurrent(): UnbondingTokensForAccount | undefined {
    return this.unbondingByAccount.get(this.currentAccount);
  }

  get unbondingAmount(): string {
    const unbonding = this.unbondingCurrent;
    if (!unbonding) return '0';

    const amount = unbonding.notYetClaimable.total.valueView.value?.amount;
    if (!amount) return '0';

    // Simple conversion - assume 6 decimal places for UM
    return fromBaseUnit(amount.lo, amount.hi, 6).toFixed(6);
  }

  get claimableAmount(): string {
    const unbonding = this.unbondingCurrent;
    if (!unbonding) return '0';

    const amount = unbonding.claimable.total.valueView.value?.amount;
    if (!amount) return '0';

    // Simple conversion - assume 6 decimal places for UM
    return fromBaseUnit(amount.lo, amount.hi, 6).toFixed(6);
  }

  get hasClaimableTokens(): boolean {
    const unbonding = this.unbondingCurrent;
    return !!unbonding?.claimable.tokens.length;
  }

  // Actions
  setCurrentAccount = (account: number) => {
    if (this.currentAccount !== account) {
      this.currentAccount = account;
      // Manually reload data when account changes
      // Reload balances first (without loading state), then validators and delegations
      void Promise.all([
        this.rootStore.balancesStore.loadAllAccountBalances(),
        this.loadUnbondings(),
      ]).then(() => {
        void this.loadValidators().then(() => {
          void this.loadDelegations();
        });
      });
    }
  };

  setAction = (action: StakingAction, validator?: ValidatorInfo) => {
    this.action = action;
    this.actionValidator = validator;
    this.amount = '';
    this.selectedBalancesResponse = undefined;
  };

  setSelectedBalancesResponse = (br?: BalancesResponse) => {
    this.selectedBalancesResponse = br;
  };

  closeAction = () => {
    this.action = undefined;
    this.actionValidator = undefined;
    this.amount = '';
    this.selectedBalancesResponse = undefined;
  };

  setAmount = (amount: string) => {
    this.amount = amount;
  };

  canUndelegate = (validator: ValidatorInfo): boolean => {
    // Check if we have delegation tokens for this validator
    const identityKey = getIdentityKeyFromValidatorInfo.optional(validator);
    if (!identityKey) return false;

    const validatorId = bech32mIdentityKey(identityKey);

    return this.delegationsCurrent.some(delegation => {
      // Get metadata from ValueView (not BalancesResponse)
      if (delegation.valueView.case !== 'knownAssetId') return false;
      const metadata = delegation.valueView.value.metadata;
      if (!metadata) return false;

      const display = getDisplay.optional(metadata);
      if (!display) return false;

      const delegationMatch = assetPatterns.delegationToken.capture(display);
      return delegationMatch?.idKey === validatorId;
    });
  };

  getVotingPower = (validator: ValidatorInfo): number => {
    const identityKey = getIdentityKeyFromValidatorInfo.optional(validator);
    if (!identityKey) return 0;

    const validatorId = bech32mIdentityKey(identityKey);
    return this.votingPowerByValidator.get(validatorId) ?? 0;
  };

  // Data loading methods
  loadValidators = async () => {
    if (this.validatorsLoading) return;

    try {
      runInAction(() => {
        this.validatorsLoading = true;
        this.error = undefined;
        this.availableValidators = [];
        this.votingPowerByValidator = new Map();
      });

      const validatorInfos: ValidatorInfo[] = [];

      // Load all available validators from StakeService validator info stream
      for await (const response of this.rootStore.penumbraService.getValidatorInfoStream(true)) {
        const validatorInfo = getValidatorInfo(response);
        if (validatorInfo) {
          validatorInfos.push(validatorInfo);
        }
      }

      runInAction(() => {
        this.availableValidators = validatorInfos;
        const votingPowerRecord =
          validatorInfos.length > 0 ? getVotingPowerByValidatorInfo(validatorInfos) : {};
        this.votingPowerByValidator = new Map(Object.entries(votingPowerRecord));
        this.validatorsLoading = false;
      });
    } catch (error) {
      console.error('Failed to load validators:', error);
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to load validators';
        this.validatorsLoading = false;
        this.availableValidators = [];
        this.votingPowerByValidator = new Map();
      });
    }
  };

  loadDelegations = async () => {
    try {
      // Ensure balances are loaded first
      if (this.rootStore.balancesStore.balancesByAccount.length === 0) {
        await this.rootStore.balancesStore.loadBalances();
      }

      // Get current account balances
      const currentAccountBalances =
        this.rootStore.balancesStore.balancesByAccount.find(
          acc => acc.account === this.currentAccount,
        )?.balances ?? [];

      // Filter for delegation token balances
      const delegationBalances = currentAccountBalances.filter(balance => {
        const metadata = getMetadataFromBalancesResponse.optional(balance);
        const display = getDisplay.optional(metadata);
        return display && assetPatterns.delegationToken.capture(display);
      });

      // Convert to ValueView and attach matching validator info
      const delegationViews: ValueView[] = [];
      for (const balance of delegationBalances) {
        const valueView = getBalanceView(balance).clone(); // Clone to modify safely
        if (valueView.valueView.case !== 'knownAssetId') continue;

        const metadata = valueView.valueView.value.metadata;
        if (!metadata) continue;

        const display = getDisplay(metadata);
        const match = assetPatterns.delegationToken.capture(display);
        if (!match) continue;

        const idKey = match.idKey;

        // Find matching validator from availableValidators
        const matchingValidator = this.availableValidators.find(validator => {
          const key = getIdentityKeyFromValidatorInfo.optional(validator);
          if (!key) return false;
          return bech32mIdentityKey(key) === idKey;
        });

        if (matchingValidator) {
          const extendedMetadata = Any.pack(matchingValidator);
          valueView.valueView.value.extendedMetadata = extendedMetadata;
        }

        // Only include if amount > 0 (to match your positive balances)
        const amount = getAmount(valueView);
        if (amount && (amount.lo !== 0n || amount.hi !== 0n)) {
          delegationViews.push(valueView);
        }
      }

      runInAction(() => {
        this.delegationsByAccount.set(this.currentAccount, delegationViews);
      });
    } catch (error) {
      console.error('Failed to load delegations:', error);
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to load delegations';
      });
    }
  };

  loadUnbondings = async () => {
    try {
      const stakingTokenMetadata = await this.getStakingTokenMetadata();

      // Get current account balances
      const currentBalances =
        this.rootStore.balancesStore.balancesByAccount.find(
          acc => acc.account === this.currentAccount,
        )?.balances ?? [];

      // Filter unbonding tokens
      const unbondingTokens = currentBalances
        .filter(balance => {
          const metadata = getMetadataFromBalancesResponse.optional(balance);
          const display = getDisplay.optional(metadata);
          return display && assetPatterns.unbondingToken.capture(display);
        })
        .map(balance => getBalanceView(balance))
        .filter(Boolean) as ValueView[];

      let claimable: ValueView[] = [];
      let notYetClaimable: ValueView[] = [];

      if (unbondingTokens.length > 0) {
        try {
          // Get current epoch using epochByHeight with current height
          // For now, we'll skip epoch checking and treat all as not yet claimable
          // This is a temporary workaround until proper epoch handling is implemented
          notYetClaimable = unbondingTokens;
        } catch (epochError) {
          console.warn(
            'Failed to get current epoch, treating all unbonding tokens as not yet claimable:',
            epochError,
          );
          notYetClaimable = unbondingTokens;
        }
      }

      // Sum function
      const sumValues = (values: ValueView[], metadata: Metadata): ValueView => {
        const totalAmount = values.reduce(
          (acc, curr) => {
            const amountA = getAmount(curr);
            if (amountA) {
              return { lo: acc.lo + amountA.lo, hi: acc.hi + amountA.hi };
            }
            return acc;
          },
          { lo: 0n, hi: 0n },
        );

        return new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: totalAmount,
              metadata,
            },
          },
        });
      };

      const zeroValue = new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: { lo: 0n, hi: 0n },
            metadata: stakingTokenMetadata,
          },
        },
      });

      const unbondingForAccount: UnbondingTokensForAccount = {
        claimable: {
          total: claimable.length > 0 ? sumValues(claimable, stakingTokenMetadata) : zeroValue,
          tokens: claimable,
        },
        notYetClaimable: {
          total:
            notYetClaimable.length > 0
              ? sumValues(notYetClaimable, stakingTokenMetadata)
              : zeroValue,
          tokens: notYetClaimable,
        },
      };

      runInAction(() => {
        this.unbondingByAccount.set(this.currentAccount, unbondingForAccount);
      });
    } catch (error) {
      console.error('Failed to load unbonding tokens:', error);
    }
  };

  // Transaction methods
  delegate = async () => {
    if (!this.actionValidator || !this.amount || !this.selectedBalancesResponse) {
      throw new Error('Missing required data for delegation');
    }

    try {
      runInAction(() => {
        this.loading = true;
        this.error = undefined; // Clear any previous errors
      });

      const stakingTokenMetadata = await this.getStakingTokenMetadata();
      const exponent = getDisplayDenomExponent(stakingTokenMetadata);
      const sourceAccount =
        getAddressIndex.optional(this.selectedBalancesResponse)?.account ?? this.currentAccount;

      // Build delegation request using the same approach as legacy minifront
      const request = new TransactionPlannerRequest({
        delegations: [
          {
            amount: toBaseUnit(BigNumber(this.amount), exponent),
            rateData: getRateData(this.actionValidator),
          },
        ],
        source: { account: sourceAccount },
      });

      // Use the new planBuildBroadcast method
      const result = await this.rootStore.penumbraService.planBuildBroadcast(request, 'delegate');

      // If result is undefined, user cancelled the transaction
      if (result === undefined) {
        runInAction(() => {
          this.loading = false;
          this.error = undefined; // Don't show error for user cancellation
        });
        return; // Exit early, don't close dialog
      }

      // Transaction succeeded - refresh data and close dialog
      runInAction(() => {
        this.closeAction();
        this.loading = false;
        this.error = undefined;
      });

      // Reload validators and balances
      await this.rootStore.balancesStore.loadBalances();
      await this.loadValidators();
      await this.loadDelegations();
    } catch (error) {
      console.error('Delegation failed:', error);
      runInAction(() => {
        // This is now only for actual errors, not user cancellation
        this.error = error instanceof Error ? error.message : 'Delegation failed';
        this.loading = false;
      });
      throw error;
    }
  };

  undelegate = async () => {
    if (!this.actionValidator || !this.amount || !this.selectedBalancesResponse) {
      throw new Error('Missing required data for undelegation');
    }

    try {
      runInAction(() => {
        this.loading = true;
        this.error = undefined;
      });

      const valueView = getBalanceView(this.selectedBalancesResponse);
      if (!valueView) {
        throw new Error('Invalid selected balance');
      }

      const exponent = getDisplayDenomExponentFromValueView(valueView);
      const amountBase = toBaseUnit(BigNumber(this.amount), exponent);
      const assetId = getAssetIdFromValueView(valueView);
      const sourceAccount =
        getAddressIndex.optional(this.selectedBalancesResponse)?.account ?? this.currentAccount;

      // Build undelegation request using the same approach as legacy minifront
      const request = new TransactionPlannerRequest({
        undelegations: [
          {
            value: {
              amount: amountBase,
              assetId,
            },
            rateData: getRateData(this.actionValidator),
          },
        ],
        source: { account: sourceAccount },
      });

      // Use the new planBuildBroadcast method
      const result = await this.rootStore.penumbraService.planBuildBroadcast(request, 'undelegate');

      // If result is undefined, user cancelled the transaction
      if (result === undefined) {
        runInAction(() => {
          this.loading = false;
          this.error = undefined;
        });
        return;
      }

      // Refresh data and close dialog
      runInAction(() => {
        this.closeAction();
        this.loading = false;
      });

      // Reload validators and balances
      await this.rootStore.balancesStore.loadBalances();
      await this.loadValidators();
      await this.loadDelegations();
      await this.loadUnbondings();
    } catch (error) {
      console.error('Undelegation failed:', error);
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Undelegation failed';
        this.loading = false;
      });
      throw error;
    }
  };

  claim = async () => {
    const unbonding = this.unbondingCurrent;
    if (!unbonding?.claimable.tokens.length) {
      throw new Error('No claimable tokens available');
    }

    try {
      runInAction(() => {
        this.loading = true;
        this.error = undefined;
      });

      // Get required app parameters and current height
      const appClient = penumbra.service(AppService);
      const viewClient = this.rootStore.penumbraService.getViewClient();

      const { appParameters } = await appClient.appParameters({});
      if (!appParameters?.stakeParams?.unbondingDelay) {
        throw new ReferenceError('Unbonding delay must be available', {
          cause: appParameters?.stakeParams,
        });
      }
      const { unbondingDelay } = appParameters.stakeParams;

      const { fullSyncHeight } = await viewClient.status({});

      // Build proper undelegate claim requests for all claimable tokens
      const undelegationClaims = await Promise.all(
        unbonding.claimable.tokens.map(unbondingValue =>
          assembleUndelegationClaim({
            currentHeight: fullSyncHeight,
            appUnbondingDelay: unbondingDelay,
            unbondingValue,
          }),
        ),
      );

      const request = new TransactionPlannerRequest({
        undelegationClaims,
        source: { account: this.currentAccount },
      });

      // Use the fixed planBuildBroadcast method
      const result = await this.rootStore.penumbraService.planBuildBroadcast(
        request,
        'undelegateClaim',
      );

      // If result is undefined, user cancelled the transaction
      if (result === undefined) {
        runInAction(() => {
          this.loading = false;
          this.error = undefined;
        });
        return;
      }

      runInAction(() => {
        this.loading = false;
      });

      // Refresh data
      await this.rootStore.balancesStore.loadBalances();
      await this.loadDelegations();
      await this.loadUnbondings();
    } catch (error) {
      console.error('Claim failed:', error);
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to claim tokens';
        this.loading = false;
      });
      throw error;
    }
  };

  // Lifecycle
  initialize = async () => {
    // Load initial data in proper order: balances -> validators -> delegations
    await Promise.all([this.rootStore.balancesStore.loadBalances(), this.loadValidators()]);

    // Then load delegations (which need both balances and validators)
    await Promise.all([this.loadDelegations(), this.loadUnbondings()]);
  };

  dispose = () => {
    this.disposers.forEach(dispose => dispose());
    this.disposers = [];
  };
}
