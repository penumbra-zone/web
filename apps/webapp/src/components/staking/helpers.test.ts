import { describe, expect, it } from 'vitest';
import { calculateCommissionAsPercentage } from './helpers';
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
