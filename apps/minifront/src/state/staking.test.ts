import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '.';
import {
  ValidatorInfo,
  ValidatorInfoResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { bech32IdentityKey } from '@penumbra-zone/types';
import { getValidatorInfoFromValueView } from '@penumbra-zone/getters';
import {
  AddressView,
  IdentityKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

const validator1IdentityKey = new IdentityKey({ ik: new Uint8Array([1, 2, 3]) });
const validator1Bech32IdentityKey = bech32IdentityKey(validator1IdentityKey);
const validatorInfoResponse1 = new ValidatorInfoResponse({
  validatorInfo: {
    status: {
      votingPower: { hi: 0n, lo: 2n },
    },
    validator: {
      name: 'Validator 1',
      identityKey: validator1IdentityKey,
    },
  },
});

const validator2IdentityKey = new IdentityKey({ ik: new Uint8Array([4, 5, 6]) });
const validator2Bech32IdentityKey = bech32IdentityKey(validator2IdentityKey);
const validatorInfoResponse2 = new ValidatorInfoResponse({
  validatorInfo: {
    status: {
      votingPower: { hi: 0n, lo: 5n },
    },
    validator: {
      name: 'Validator 2',
      identityKey: validator2IdentityKey,
    },
  },
});

const validator3IdentityKey = new IdentityKey({ ik: new Uint8Array([7, 8, 9]) });
const validatorInfoResponse3 = new ValidatorInfoResponse({
  validatorInfo: {
    status: {
      votingPower: { hi: 0n, lo: 3n },
    },
    validator: {
      name: 'Validator 3',
      identityKey: validator3IdentityKey,
    },
  },
});

const validator4IdentityKey = new IdentityKey({ ik: new Uint8Array([0]) });
const validatorInfoResponse4 = new ValidatorInfoResponse({
  validatorInfo: {
    status: {
      votingPower: { hi: 0n, lo: 9n },
    },
    validator: {
      name: 'Validator 4',
      identityKey: validator4IdentityKey,
    },
  },
});

const mockStakeClient = vi.hoisted(() => ({
  validatorInfo: vi.fn(async function* () {
    yield await Promise.resolve(validatorInfoResponse1);
    yield await Promise.resolve(validatorInfoResponse2);
    yield await Promise.resolve(validatorInfoResponse3);
    yield await Promise.resolve(validatorInfoResponse4);
  }),
}));

vi.mock('../fetchers/balances', () => ({
  getBalances: vi.fn(async () =>
    Promise.resolve([
      {
        balanceView: new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 1n },
              metadata: {
                display: `delegation_${validator1Bech32IdentityKey}`,
              },
              extendedMetadata: {
                typeUrl: ValidatorInfo.typeName,
                value: validatorInfoResponse1.validatorInfo?.toBinary(),
              },
            },
          },
        }),
        accountAddress: new AddressView({
          addressView: {
            case: 'decoded',
            value: {
              index: {
                account: 0,
              },
            },
          },
        }),
      },
      {
        balanceView: new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 2n },
              metadata: {
                display: `delegation_${validator2Bech32IdentityKey}`,
              },
              extendedMetadata: {
                typeUrl: ValidatorInfo.typeName,
                value: validatorInfoResponse2.validatorInfo?.toBinary(),
              },
            },
          },
        }),
        accountAddress: new AddressView({
          addressView: {
            case: 'decoded',
            value: {
              index: {
                account: 0,
              },
            },
          },
        }),
      },
      {
        balanceView: new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 5n },
              metadata: {
                display: 'penumbra',
              },
            },
          },
        }),
        accountAddress: new AddressView({
          addressView: {
            case: 'decoded',
            value: {
              index: {
                account: 0,
              },
            },
          },
        }),
      },
    ]),
  ),
}));

const mockViewClient = vi.hoisted(() => ({
  assetMetadataById: vi.fn(() => new Metadata()),
}));

vi.mock('../clients', () => ({
  stakeClient: mockStakeClient,
  viewClient: mockViewClient,
}));

describe('Staking Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore()) as UseBoundStore<StoreApi<AllSlices>>;
  });

  it('has correct initial state', () => {
    expect(useStore.getState().staking).toEqual({
      account: 0,
      action: undefined,
      amount: '',
      validatorInfo: undefined,
      delegationsByAccount: new Map(),
      unstakedTokensByAccount: new Map(),
      unbondingTokensByAccount: new Map(),
      setAccount: expect.any(Function) as unknown,
      loadDelegationsForCurrentAccount: expect.any(Function) as unknown,
      loadUnstakedAndUnbondingTokensByAccount: expect.any(Function) as unknown,
      delegate: expect.any(Function) as unknown,
      undelegate: expect.any(Function) as unknown,
      onClickActionButton: expect.any(Function) as unknown,
      onClose: expect.any(Function) as unknown,
      setAmount: expect.any(Function) as unknown,
      error: undefined,
      loading: false,
      votingPowerByValidatorInfo: {},
    });
  });

  it('adds the delegation tokens from responses to the state, sorted by balance (descending) then voting power (descending)', async () => {
    const { getState } = useStore;

    await getState().staking.loadDelegationsForCurrentAccount();

    const delegations = getState().staking.delegationsByAccount.get(0)!;

    /**
     * Note sorting - validator 2 comes before validator 1, since we have a
     * higher balance of validator 2's delegation tokens. And validator 4 comes
     * before validator 3 at the end: we have a 0 balance of both, but validator
     * 4 has more voting power.
     */
    expect(getValidatorInfoFromValueView(delegations[0])).toEqual(
      validatorInfoResponse2.validatorInfo,
    );
    expect(getValidatorInfoFromValueView(delegations[1])).toEqual(
      validatorInfoResponse1.validatorInfo,
    );
    expect(getValidatorInfoFromValueView(delegations[2])).toEqual(
      validatorInfoResponse4.validatorInfo,
    );
    expect(getValidatorInfoFromValueView(delegations[3])).toEqual(
      validatorInfoResponse3.validatorInfo,
    );
  });

  it('calculates the percentage voting power once all delegations are loaded', async () => {
    const { getState } = useStore;

    expect(getState().staking.votingPowerByValidatorInfo).toEqual({});
    await getState().staking.loadDelegationsForCurrentAccount();
    expect(Object.values(getState().staking.votingPowerByValidatorInfo).length).toBe(4);
  });
});
