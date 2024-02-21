import { describe, expect, it } from 'vitest';
import { calculateCommissionAsPercentage, getVotingPowerByValidatorInfo } from './staking';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';

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
    },
  });

  const validatorInfo2 = new ValidatorInfo({
    status: {
      votingPower: { hi: 0n, lo: 2n },
    },
    validator: {
      name: 'Validator 2',
    },
  });

  const validatorInfo3 = new ValidatorInfo({
    status: {
      votingPower: { hi: 0n, lo: 1n },
    },
    validator: {
      name: 'Validator 3',
    },
  });

  it('accurately calculates voting power for each validator', () => {
    const result = getVotingPowerByValidatorInfo([validatorInfo1, validatorInfo2, validatorInfo3]);

    expect(result.get(validatorInfo1)).toBe(40);
    expect(result.get(validatorInfo2)).toBe(40);
    expect(result.get(validatorInfo3)).toBe(20);
  });
});
