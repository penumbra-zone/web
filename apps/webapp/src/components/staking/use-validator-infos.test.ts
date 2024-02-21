import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useValidatorInfos } from './use-validator-infos';
import { renderHook, waitFor } from '@testing-library/react';
import { ValidatorInfoResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';

const validatorInfoResponse1 = new ValidatorInfoResponse({
  validatorInfo: {
    status: {
      votingPower: { hi: 0n, lo: 2n },
    },
    validator: {
      name: 'Validator 1',
    },
  },
});

const validatorInfoResponse2 = new ValidatorInfoResponse({
  validatorInfo: {
    status: {
      votingPower: { hi: 0n, lo: 2n },
    },
    validator: {
      name: 'Validator 2',
    },
  },
});

const validatorInfoResponse3 = new ValidatorInfoResponse({
  validatorInfo: {
    status: {
      votingPower: { hi: 0n, lo: 1n },
    },
    validator: {
      name: 'Validator 3',
    },
  },
});

const mockStakingClient = vi.hoisted(() => ({
  validatorInfo: vi.fn(async function* () {
    yield await Promise.resolve(validatorInfoResponse1);
    yield await Promise.resolve(validatorInfoResponse2);
    yield await Promise.resolve(validatorInfoResponse3);
    return;
  }),
}));

vi.mock('../../clients/grpc', () => ({
  stakingClient: mockStakingClient,
}));

describe('useValidatorInfos()', () => {
  beforeEach(() => {
    mockStakingClient.validatorInfo.mockClear();
  });

  it('initially returns a loading state', () => {
    const { result } = renderHook(useValidatorInfos);

    expect(result.current).toEqual({
      validatorInfos: [],
      votingPowerByValidatorInfo: new Map(),
      loading: true,
      error: undefined,
    });
  });

  it('adds the validator infos from responses to the state', async () => {
    const { rerender, result } = renderHook(useValidatorInfos);

    await waitFor(() => {
      rerender({});

      expect(result.current.validatorInfos).toEqual([
        validatorInfoResponse1.validatorInfo,
        validatorInfoResponse2.validatorInfo,
        validatorInfoResponse3.validatorInfo,
      ]);
    });
  });

  it('only calculates the voting power once all validator infos are loaded', async () => {
    const { rerender, result } = renderHook(useValidatorInfos);

    expect(result.current.votingPowerByValidatorInfo.size).toBe(0);
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      rerender({});
      expect(result.current.votingPowerByValidatorInfo.size).toBe(3);
    });

    // Run this expectation as soon as we've asserted that the voting power has
    // been calculated. That way, we can be sure that the loading turned to
    // false, and the voting power got calculated, at the same time.
    expect(result.current.loading).toBe(false);
  });
});
