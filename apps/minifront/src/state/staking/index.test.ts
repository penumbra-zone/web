import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@bufbuild/protobuf';
import { create as createStore, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from '..';
import { ValidatorInfoSchema } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import {
  MetadataSchema,
  ValueViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { getValidatorInfoFromValueView } from '@penumbra-zone/getters/value-view';
import {
  AddressViewSchema,
  IdentityKeySchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { THROTTLE_MS } from '.';
import { DelegationsByAddressIndexResponseSchema } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { anyPack } from '@bufbuild/protobuf/wkt';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));
const validator1IdentityKey = create(IdentityKeySchema, { ik: u8(32) });
const validator1Bech32IdentityKey = bech32mIdentityKey(validator1IdentityKey);
const validatorInfo1 = create(ValidatorInfoSchema, {
  status: {
    votingPower: { hi: 0n, lo: 2n },
  },
  validator: {
    name: 'Validator 1',
    identityKey: validator1IdentityKey,
  },
});

const validator2IdentityKey = create(IdentityKeySchema, {
  ik: u8(32),
});
const validator2Bech32IdentityKey = bech32mIdentityKey(validator2IdentityKey);
const validatorInfo2 = create(ValidatorInfoSchema, {
  status: {
    votingPower: { hi: 0n, lo: 5n },
  },
  validator: {
    name: 'Validator 2',
    identityKey: validator2IdentityKey,
  },
});

const validator3IdentityKey = create(IdentityKeySchema, {
  ik: u8(32),
});
const validatorInfo3 = create(ValidatorInfoSchema, {
  status: {
    votingPower: { hi: 0n, lo: 3n },
  },
  validator: {
    name: 'Validator 3',
    identityKey: validator3IdentityKey,
  },
});

const validator4IdentityKey = create(IdentityKeySchema, { ik: u8(32) });
const validatorInfo4 = create(ValidatorInfoSchema, {
  status: {
    votingPower: { hi: 0n, lo: 9n },
  },
  validator: {
    name: 'Validator 4',
    identityKey: validator4IdentityKey,
  },
});

vi.mock('../../fetchers/registry', async () => ({
  ...(await vi.importActual('../../fetchers/registry')),
  getStakingTokenMetadata: vi.fn(async () => Promise.resolve(create(MetadataSchema))),
}));

vi.mock('../../fetchers/balances', () => ({
  getBalancesStream: vi.fn(() => ({
    [Symbol.asyncIterator]: async function* () {
      await new Promise(resolve => void setTimeout(resolve, 0));
      yield {
        balanceView: create(ValueViewSchema, {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 1n },
              metadata: {
                display: `delegation_${validator1Bech32IdentityKey}`,
              },
              extendedMetadata: anyPack(ValidatorInfoSchema, validatorInfo1),
            },
          },
        }),
        accountAddress: create(AddressViewSchema, {
          addressView: {
            case: 'decoded',
            value: {
              index: {
                account: 0,
              },
              address: {},
            },
          },
        }),
      };
      yield {
        balanceView: create(ValueViewSchema, {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 2n },
              metadata: {
                display: `delegation_${validator2Bech32IdentityKey}`,
              },
              extendedMetadata: anyPack(ValidatorInfoSchema, validatorInfo2),
            },
          },
        }),
        accountAddress: create(AddressViewSchema, {
          addressView: {
            case: 'decoded',
            value: {
              index: {
                account: 0,
              },
              address: {},
            },
          },
        }),
      };
      yield {
        balanceView: create(ValueViewSchema, {
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
        accountAddress: create(AddressViewSchema, {
          addressView: {
            case: 'decoded',
            value: {
              index: {
                account: 0,
              },
              address: {},
            },
          },
        }),
      };
    },
  })),
}));

vi.mock('../../penumbra', () => ({
  penumbra: {
    service: vi.fn(() => hoisted.mockViewClient),
  },
}));

const hoisted = vi.hoisted(() => ({
  mockViewClient: {
    assetMetadataById: vi.fn(() => create(MetadataSchema)),
    delegationsByAddressIndex: vi.fn(async function* () {
      yield await Promise.resolve(
        create(DelegationsByAddressIndexResponseSchema, {
          valueView: {
            valueView: {
              case: 'knownAssetId',
              value: {
                amount: { hi: 0n, lo: 1n },
                extendedMetadata: anyPack(ValidatorInfoSchema, validatorInfo1),
              },
            },
          },
        }),
      );
      yield await Promise.resolve(
        create(DelegationsByAddressIndexResponseSchema, {
          valueView: {
            valueView: {
              case: 'knownAssetId',
              value: {
                amount: { hi: 0n, lo: 2n },
                extendedMetadata: anyPack(ValidatorInfoSchema, validatorInfo2),
              },
            },
          },
        }),
      );
      yield await Promise.resolve(
        create(DelegationsByAddressIndexResponseSchema, {
          valueView: {
            valueView: {
              case: 'knownAssetId',
              value: {
                amount: { hi: 0n, lo: 0n },
                extendedMetadata: anyPack(ValidatorInfoSchema, validatorInfo3),
              },
            },
          },
        }),
      );
      yield await Promise.resolve(
        create(DelegationsByAddressIndexResponseSchema, {
          valueView: {
            valueView: {
              case: 'knownAssetId',
              value: {
                amount: { hi: 0n, lo: 0n },
                extendedMetadata: anyPack(ValidatorInfoSchema, validatorInfo4),
              },
            },
          },
        }),
      );
    }),
  },
}));

describe('Staking Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = createStore<AllSlices>()(initializeStore()) as UseBoundStore<StoreApi<AllSlices>>;
    vi.useFakeTimers();
  });

  it('has correct initial state', () => {
    expect(useStore.getState().staking).toEqual({
      account: 0,
      action: undefined,
      amount: '',
      validatorInfo: undefined,
      delegationsByAccount: new Map(),
      unbondingTokensByAccount: new Map(),
      setAccount: expect.any(Function) as unknown,
      loadDelegationsForCurrentAccount: expect.any(Function) as unknown,
      loadUnbondingTokensForCurrentAccount: expect.any(Function) as unknown,
      delegate: expect.any(Function) as unknown,
      undelegate: expect.any(Function) as unknown,
      undelegateClaim: expect.any(Function) as unknown,
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
    vi.advanceTimersByTime(THROTTLE_MS);

    const delegations = getState().staking.delegationsByAccount.get(0)!;

    /**
     * Note sorting - validator 2 comes before validator 1, since we have a
     * higher balance of validator 2's delegation tokens. And validator 4 comes
     * before validator 3 at the end: we have a 0 balance of both, but validator
     * 4 has more voting power.
     */
    expect(getValidatorInfoFromValueView(delegations[0])).toEqual(validatorInfo2);
    expect(getValidatorInfoFromValueView(delegations[1])).toEqual(validatorInfo1);
    expect(getValidatorInfoFromValueView(delegations[2])).toEqual(validatorInfo4);
    expect(getValidatorInfoFromValueView(delegations[3])).toEqual(validatorInfo3);
  });

  it('calculates the percentage voting power once all delegations are loaded', async () => {
    const { getState } = useStore;

    expect(getState().staking.votingPowerByValidatorInfo).toEqual({});
    await getState().staking.loadDelegationsForCurrentAccount();
    expect(Object.values(getState().staking.votingPowerByValidatorInfo).length).toBe(4);
  });
});
