import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '.';
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
      votingPower: { hi: 0n, lo: 5n },
    },
    validator: {
      name: 'Validator 2',
    },
  },
});

const validatorInfoResponse3 = new ValidatorInfoResponse({
  validatorInfo: {
    status: {
      votingPower: { hi: 0n, lo: 3n },
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

vi.mock('../clients/grpc', () => ({
  stakingClient: mockStakingClient,
}));

describe('Staking Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore()) as UseBoundStore<StoreApi<AllSlices>>;
  });

  it('has correct initial state', () => {
    expect(useStore.getState().staking).toEqual({
      loadValidators: expect.any(Function) as unknown,
      validatorInfos: [],
      error: undefined,
      loading: false,
      votingPowerByValidatorInfo: new Map(),
    });
  });

  it('adds the validator infos from responses to the state', async () => {
    const { getState } = useStore;

    await getState().staking.loadValidators();

    expect(getState().staking.validatorInfos).toContain(validatorInfoResponse1.validatorInfo);
    expect(getState().staking.validatorInfos).toContain(validatorInfoResponse2.validatorInfo);
    expect(getState().staking.validatorInfos).toContain(validatorInfoResponse3.validatorInfo);
  });

  it('sorts the validator infos by voting power, descending', async () => {
    const { getState } = useStore;

    await getState().staking.loadValidators();

    expect(getState().staking.validatorInfos[0]).toBe(validatorInfoResponse2.validatorInfo);
    expect(getState().staking.validatorInfos[1]).toBe(validatorInfoResponse3.validatorInfo);
    expect(getState().staking.validatorInfos[2]).toBe(validatorInfoResponse1.validatorInfo);
  });

  it('calculates the percentage voting power once all validator infos are loaded', async () => {
    const { getState } = useStore;

    expect(getState().staking.votingPowerByValidatorInfo.size).toBe(0);
    await getState().staking.loadValidators();
    expect(getState().staking.votingPowerByValidatorInfo.size).toBe(3);
  });
});
