import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from '..';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { getValidatorInfoFromValueView } from '@penumbra-zone/getters/value-view';
import {
  AddressView,
  IdentityKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { THROTTLE_MS } from '.';
import { DelegationsByAddressIndexResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));
const validator1IdentityKey = new IdentityKey({ ik: u8(32) });
const validator1Bech32IdentityKey = bech32mIdentityKey(validator1IdentityKey);
const validatorInfo1 = new ValidatorInfo({
  status: {
    votingPower: { hi: 0n, lo: 2n },
  },
  validator: {
    name: 'Validator 1',
    identityKey: validator1IdentityKey,
  },
});

const validator2IdentityKey = new IdentityKey({
  ik: u8(32),
});
const validator2Bech32IdentityKey = bech32mIdentityKey(validator2IdentityKey);
const validatorInfo2 = new ValidatorInfo({
  status: {
    votingPower: { hi: 0n, lo: 5n },
  },
  validator: {
    name: 'Validator 2',
    identityKey: validator2IdentityKey,
  },
});

const validator3IdentityKey = new IdentityKey({
  ik: u8(32),
});
const validatorInfo3 = new ValidatorInfo({
  status: {
    votingPower: { hi: 0n, lo: 3n },
  },
  validator: {
    name: 'Validator 3',
    identityKey: validator3IdentityKey,
  },
});

const validator4IdentityKey = new IdentityKey({ ik: u8(32) });
const validatorInfo4 = new ValidatorInfo({
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
  getStakingTokenMetadata: vi.fn(async () => Promise.resolve(new Metadata())),
}));

vi.mock('../../fetchers/balances', () => ({
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
                value: validatorInfo1.toBinary(),
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
              address: {},
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
                value: validatorInfo2.toBinary(),
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
              address: {},
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
              address: {},
            },
          },
        }),
      },
    ]),
  ),
}));

const mockViewClient = vi.hoisted(() => ({
  assetMetadataById: vi.fn(() => new Metadata()),
  delegationsByAddressIndex: vi.fn(async function* () {
    yield await Promise.resolve(
      new DelegationsByAddressIndexResponse({
        valueView: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 1n },
              extendedMetadata: {
                typeUrl: ValidatorInfo.typeName,
                value: validatorInfo1.toBinary(),
              },
            },
          },
        },
      }),
    );
    yield await Promise.resolve(
      new DelegationsByAddressIndexResponse({
        valueView: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 2n },
              extendedMetadata: {
                typeUrl: ValidatorInfo.typeName,
                value: validatorInfo2.toBinary(),
              },
            },
          },
        },
      }),
    );
    yield await Promise.resolve(
      new DelegationsByAddressIndexResponse({
        valueView: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 0n },
              extendedMetadata: {
                typeUrl: ValidatorInfo.typeName,
                value: validatorInfo3.toBinary(),
              },
            },
          },
        },
      }),
    );
    yield await Promise.resolve(
      new DelegationsByAddressIndexResponse({
        valueView: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 0n },
              extendedMetadata: {
                typeUrl: ValidatorInfo.typeName,
                value: validatorInfo4.toBinary(),
              },
            },
          },
        },
      }),
    );
  }),
}));

vi.mock('../../clients', () => ({
  viewClient: mockViewClient,
}));

describe('Staking Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore()) as UseBoundStore<StoreApi<AllSlices>>;
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
      stakingTokensAndFilter: expect.objectContaining({ data: undefined }) as unknown,
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
