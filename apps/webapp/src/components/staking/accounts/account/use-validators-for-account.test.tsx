import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useValidatorsForAccount } from './use-validators-for-account';
import { renderHook } from '@testing-library/react';
import { AssetBalance } from '../../../../fetchers/balances';
import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { useStore } from '../../../../state';

const VALIDATOR_BECH32_IDENTITY_KEY =
  'penumbravalid1pv99gcy82r68usualh5yxktmyyne2v2k59vm2nfk7vqdr5zjwupq3t3sq7';

const delegationMetadata = Metadata.fromJson({
  display: `delegation_${VALIDATOR_BECH32_IDENTITY_KEY}`,
});

const unbondingMetadata = Metadata.fromJson({
  display: `uunbonding_epoch_1_${VALIDATOR_BECH32_IDENTITY_KEY}`,
});

const validatorInfo1 = ValidatorInfo.fromJson({
  validator: {
    name: 'Validator 1',
    identityKey: {
      ik: 'CwpUYIdQ9H5Dnf3oQ1l7ISeVMVahWbVNNvMA0dBSdwI=',
    },
  },
});

const validatorInfo2 = new ValidatorInfo({
  validator: {
    name: 'Validator 2',
    identityKey: {
      ik: new Uint8Array([0, 1, 2, 3]),
    },
  },
});

const validatorInfo3 = new ValidatorInfo({
  validator: {
    name: 'Validator 3',
    identityKey: {
      ik: new Uint8Array([4, 5, 6, 7]),
    },
  },
});

const stakingMetadata = Metadata.fromJson({
  display: 'penumbra',
});

const delegationTokens = {
  address: new AddressView(),
  usdcValue: 0,
  value: new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: {
          hi: 0n,
          lo: 123n,
        },
        metadata: delegationMetadata,
      },
    },
  }),
};

const unbondingTokens = {
  address: new AddressView(),
  usdcValue: 0,
  value: new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: {
          hi: 0n,
          lo: 456n,
        },
        metadata: unbondingMetadata,
      },
    },
  }),
};

const unstakedTokens = {
  address: new AddressView(),
  usdcValue: 0,
  value: new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: {
          hi: 0n,
          lo: 789n,
        },
        metadata: stakingMetadata,
      },
    },
  }),
};

const assetBalances: AssetBalance[] = [delegationTokens, unbondingTokens, unstakedTokens];

describe('useValidatorsForAccount()', () => {
  beforeEach(() => {
    useStore.setState({
      staking: {
        validatorInfos: [validatorInfo1, validatorInfo2, validatorInfo3],
        loading: false,
        error: undefined,
        loadValidators: vi.fn(),
        votingPowerByValidatorInfo: new Map(),
      },
    });
  });

  describe('validatorInfos', () => {
    it('is a list of validators relevant to the given account', () => {
      const { result } = renderHook(() => useValidatorsForAccount(assetBalances));

      expect(result.current.validatorInfos).toEqual([validatorInfo1]);
    });
  });

  describe('delegationTokensByValidatorInfo', () => {
    it('is a map of validators to delegation tokens', () => {
      const { result } = renderHook(() => useValidatorsForAccount(assetBalances));

      expect(result.current.delegationTokensByValidatorInfo.get(validatorInfo1)).toBe(
        delegationTokens.value,
      );
      expect(result.current.delegationTokensByValidatorInfo.get(validatorInfo2)).toBeUndefined();
      expect(result.current.delegationTokensByValidatorInfo.get(validatorInfo3)).toBeUndefined();
    });
  });

  describe('unbondingTokensByValidatorInfo', () => {
    it('is a map of validators to unbonding tokens', () => {
      const { result } = renderHook(() => useValidatorsForAccount(assetBalances));

      expect(result.current.unbondingTokensByValidatorInfo.get(validatorInfo1)).toBe(
        unbondingTokens.value,
      );
      expect(result.current.unbondingTokensByValidatorInfo.get(validatorInfo2)).toBeUndefined();
      expect(result.current.unbondingTokensByValidatorInfo.get(validatorInfo3)).toBeUndefined();
    });
  });

  describe('unstakedTokensByValidatorInfo', () => {
    it('is a map of validators to unstaked tokens', () => {
      const { result } = renderHook(() => useValidatorsForAccount(assetBalances));

      expect(result.current.unstakedTokens).toBe(unstakedTokens.value);
    });
  });
});
