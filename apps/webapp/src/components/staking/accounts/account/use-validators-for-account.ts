import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { useMemo } from 'react';
import {
  bech32IdentityKey,
  getDisplayDenomFromView,
  getIdentityKeyFromValidatorInfo,
} from '@penumbra-zone/types';
import { AssetBalance } from '../../../../fetchers/balances';
import { getBech32IdentityKeyFromValueView } from './helpers';
import { STAKING_TOKEN, assetPatterns } from '@penumbra-zone/constants';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { stakingSelector } from '../../../../state/staking';
import { useStore } from '../../../../state';

const hasDelegationOrUnbondingTokens =
  (delegationBalances: AssetBalance[], unbondingBalances: AssetBalance[]) =>
  (validatorInfo: ValidatorInfo): boolean => {
    const identityKey = bech32IdentityKey(getIdentityKeyFromValidatorInfo(validatorInfo));
    const hasDelegationTokens = delegationBalances.some(
      ({ value }) => getBech32IdentityKeyFromValueView(value) === identityKey,
    );
    const hasUnbondingTokens = unbondingBalances.some(
      ({ value }) => getBech32IdentityKeyFromValueView(value) === identityKey,
    );

    return hasDelegationTokens || hasUnbondingTokens;
  };

const getTokensByValidatorInfo = (
  validatorInfos: ValidatorInfo[],
  delegationBalances: AssetBalance[],
  unbondingBalances: AssetBalance[],
) => {
  const delegationTokensByValidatorInfo = new Map<ValidatorInfo, ValueView | undefined>();
  const unbondingTokensByValidatorInfo = new Map<ValidatorInfo, ValueView | undefined>();

  validatorInfos.forEach(validatorInfo => {
    const validatorIdentityKey = bech32IdentityKey(getIdentityKeyFromValidatorInfo(validatorInfo));

    delegationTokensByValidatorInfo.set(
      validatorInfo,
      delegationBalances.find(
        balance => getBech32IdentityKeyFromValueView(balance.value) === validatorIdentityKey,
      )?.value,
    );
    unbondingTokensByValidatorInfo.set(
      validatorInfo,
      unbondingBalances.find(
        balance => getBech32IdentityKeyFromValueView(balance.value) === validatorIdentityKey,
      )?.value,
    );
  });

  return { delegationTokensByValidatorInfo, unbondingTokensByValidatorInfo };
};

interface UseValidatorsForAccount {
  /**
   * Any error in loading validators.
   */
  error: unknown;

  /**
   * Whether we're currently still loading validators.
   */
  loading: boolean;

  /**
   * Whether we should render anything for this account. Will be `true` if
   * this account has any unstaked tokens, OR any delegation tokens bonded to
   * an active validator, OR any unbonding tokens from an active validator.
   */
  shouldRender: boolean;

  /**
   * A `Map` of `ValidatorInfo`s to `ValueView`s containing this account's
   * balance of delegation tokens to that validator. Will be `undefined` if this
   * account has no delegation tokens for the validator.
   */
  delegationTokensByValidatorInfo: Map<ValidatorInfo, ValueView | undefined>;

  /**
   * A `Map` of `ValidatorInfo`s to `ValueView`s containing this account's
   * balance of unbonding tokens to that validator. Will be `undefined` if this
   * account has no delegation tokens for the validator.
   */
  unbondingTokensByValidatorInfo: Map<ValidatorInfo, ValueView | undefined>;

  /**
   * An array of `ValidatorInfo`s that this account has delegation tokens in, or
   * unbonding tokens from. Use this array to render validators relevant to this
   * account.
   */
  validatorInfos: ValidatorInfo[];

  /**
   * A `Map` of `ValidatorInfo`s to their voting power, expressed as an integer
   * percentage between 0-100.
   */
  votingPowerByValidatorInfo: Map<ValidatorInfo, number>;

  /**
   * A `ValueView` representing this account's amount of unstaked tokens --
   * i.e., tokens available for staking in a validator. Will be `undefined` if
   * this account has no unstaked tokens.
   */
  unstakedTokens: ValueView | undefined;
}

/**
 * Returns all data needed to render the `<Account />` component. See the
 * `UseValidatorsForAccount` interface above for details on what it returns.
 *
 * This hook is a bit of a bear, but at present, there doesn't seem to be a
 * better way to do it. (If you find a better way, feel free to refactor.) To
 * optimize performance, it makes heavy use of `useMemo()`.
 */
export const useValidatorsForAccount = (assetBalances: AssetBalance[]): UseValidatorsForAccount => {
  // First, grab validator infos from context.
  const {
    validatorInfos: unfilteredValidatorInfos,
    votingPowerByValidatorInfo,
    loading,
    error,
  } = useStore(stakingSelector);

  // Then, grab the unstaked tokens, delegation tokens, and unbonding tokens
  // from this account.
  const { unstakedTokens, delegationBalances, unbondingBalances } = useMemo(
    () => ({
      unstakedTokens: assetBalances.find(
        balance => getDisplayDenomFromView(balance.value) === STAKING_TOKEN,
      )?.value,
      delegationBalances: assetBalances.filter(balance =>
        assetPatterns.delegationToken.test(getDisplayDenomFromView(balance.value)),
      ),
      unbondingBalances: assetBalances.filter(balance =>
        assetPatterns.unbondingToken.test(getDisplayDenomFromView(balance.value)),
      ),
    }),
    [assetBalances],
  );

  // Next, filter validator infos for just those that we have delegation or
  // unbonding tokens for.
  const validatorInfos = useMemo(
    () =>
      unfilteredValidatorInfos.filter(
        hasDelegationOrUnbondingTokens(delegationBalances, unbondingBalances),
      ),
    [unfilteredValidatorInfos, delegationBalances, unbondingBalances],
  );

  // Lastly, create `Map`s of validator infos to the delegation and unbonding
  // tokens we hold.
  const { delegationTokensByValidatorInfo, unbondingTokensByValidatorInfo } = useMemo(
    () => getTokensByValidatorInfo(validatorInfos, delegationBalances, unbondingBalances),
    [validatorInfos, delegationBalances, unbondingBalances],
  );

  const shouldRender = !!unstakedTokens || !!validatorInfos.length;

  return {
    validatorInfos,
    delegationTokensByValidatorInfo,
    unbondingTokensByValidatorInfo,
    votingPowerByValidatorInfo,
    unstakedTokens,
    loading,
    error,
    shouldRender,
  };
};
