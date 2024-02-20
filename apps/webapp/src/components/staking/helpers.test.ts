import { describe, expect, it } from 'vitest';
import { calculateCommission } from './helpers';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';

describe('calculateCommission()', () => {
  const validatorInfo = new ValidatorInfo({
    validator: {
      fundingStreams: [
        {
          recipient: {
            case: 'toAddress',
            value: {
              rateBps: 1,
            },
          },
        },
        {
          recipient: {
            case: 'toCommunityPool',
            value: {
              rateBps: 2,
            },
          },
        },
        {
          recipient: {
            case: 'toAddress',
            value: {
              rateBps: 3,
            },
          },
        },
      ],
    },
  });

  it("returns the sum of all of a validator's funding streams' rates", () => {
    expect(calculateCommission(validatorInfo)).toBe(6);
  });
});
