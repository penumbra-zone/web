import { describe, expect, it } from 'vitest';
import { calculateCommissionAsPercentage, getVotingPowerByValidatorInfo } from './staking';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { getIdentityKeyFromValidatorInfo } from '@penumbra-zone/getters/validator-info';

describe('calculateCommission()', () => {
  const validatorInfo = new ValidatorInfo({
    validator: {
      fundingStreams: [
        {
          recipient: {
            case: 'toAddress',
            value: {
              rateBps: 100,
            },
          },
        },
        {
          recipient: {
            case: 'toCommunityPool',
            value: {
              rateBps: 200,
            },
          },
        },
        {
          recipient: {
            case: 'toAddress',
            value: {
              rateBps: 300,
            },
          },
        },
      ],
    },
  });

  it("returns the sum of all of a validator's funding streams' rates", () => {
    expect(calculateCommissionAsPercentage(validatorInfo)).toBe(6);
  });
});

describe('getVotingPowerByValidatorInfo()', () => {
  const validatorInfo1 = new ValidatorInfo({
    status: {
      votingPower: { hi: 0n, lo: 2n },
    },
    validator: {
      name: 'Validator 1',
      identityKey: { ik: Uint8Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)) },
    },
  });

  const validatorInfo2 = new ValidatorInfo({
    status: {
      votingPower: { hi: 0n, lo: 2n },
    },
    validator: {
      name: 'Validator 2',
      identityKey: { ik: Uint8Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)) },
    },
  });

  const validatorInfo3 = new ValidatorInfo({
    status: {
      votingPower: { hi: 0n, lo: 1n },
    },
    validator: {
      name: 'Validator 3',
      identityKey: { ik: Uint8Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)) },
    },
  });

  const validator1Bech32IdentityKey = bech32mIdentityKey(
    getIdentityKeyFromValidatorInfo(validatorInfo1),
  );

  const validator2Bech32IdentityKey = bech32mIdentityKey(
    getIdentityKeyFromValidatorInfo(validatorInfo2),
  );

  const validator3Bech32IdentityKey = bech32mIdentityKey(
    getIdentityKeyFromValidatorInfo(validatorInfo3),
  );

  it('accurately calculates voting power for each validator', () => {
    const result = getVotingPowerByValidatorInfo([validatorInfo1, validatorInfo2, validatorInfo3]);

    expect(result[validator1Bech32IdentityKey]).toBe(40);
    expect(result[validator2Bech32IdentityKey]).toBe(40);
    expect(result[validator3Bech32IdentityKey]).toBe(20);
  });
});
