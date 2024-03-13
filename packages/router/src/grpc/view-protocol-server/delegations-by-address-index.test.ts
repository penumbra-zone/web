import { beforeEach, describe, expect, it, vi } from 'vitest';
import { delegationsByAddressIndex } from './delegations-by-address-index';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import {
  HandlerContext,
  createHandlerContext,
  createContextValues,
  PromiseClient,
} from '@connectrpc/connect';
import { stakingClientCtx } from '../../ctx';
import { QueryService as StakingService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';
import {
  AssetMetadataByIdResponse,
  BalancesResponse,
  DelegationsByAddressIndexRequest,
  DelegationsByAddressIndexRequest_Filter,
  DelegationsByAddressIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { STAKING_TOKEN_METADATA } from '@penumbra-zone/constants';
import {
  ValidatorInfoRequest,
  ValidatorInfoResponse,
  ValidatorState_ValidatorStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { asIdentityKey, getAmount, getValidatorInfoFromValueView } from '@penumbra-zone/getters';
import { PartialMessage } from '@bufbuild/protobuf';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

const mockBalances = vi.hoisted(() => vi.fn());
vi.mock('./balances', () => ({
  balances: mockBalances,
}));

vi.mock('./asset-metadata-by-id', () => ({
  assetMetadataById: () =>
    Promise.resolve(new AssetMetadataByIdResponse({ denomMetadata: new Metadata() })),
}));

const activeValidatorBech32IdentityKey =
  'penumbravalid1zpwtnnmeu2fdqx9dslmd5sc44rja4jqlzqvzel8tajkk6ur7jyqq0cgcy9';
const activeValidatorInfoResponse = new ValidatorInfoResponse({
  validatorInfo: {
    validator: {
      name: 'Active validator',
      identityKey: asIdentityKey(activeValidatorBech32IdentityKey),
    },
    status: {
      state: { state: ValidatorState_ValidatorStateEnum.ACTIVE },
    },
  },
});

const activeValidator2Bech32IdentityKey =
  'penumbravalid1tnsyu4tppg7rwgyl3wwcfxwfq6g6ahmlyywqvt77a2zlx6s34qpsxxh7qm';
const activeValidator2InfoResponse = new ValidatorInfoResponse({
  validatorInfo: {
    validator: {
      name: 'Active validator 2',
      identityKey: asIdentityKey(activeValidator2Bech32IdentityKey),
    },
    status: {
      state: { state: ValidatorState_ValidatorStateEnum.ACTIVE },
    },
  },
});

const inactiveValidatorBech32IdentityKey =
  'penumbravalid1r6ja22cl476tluzea3w07r8kxl46ppqlckcvyzslg3ywsmqdnyys86t55e';
const inactiveValidatorInfoResponse = new ValidatorInfoResponse({
  validatorInfo: {
    validator: {
      name: 'Inactive validator',
      identityKey: asIdentityKey(inactiveValidatorBech32IdentityKey),
    },
    status: {
      state: { state: ValidatorState_ValidatorStateEnum.INACTIVE },
    },
  },
});

const inactiveValidator2Bech32IdentityKey =
  'penumbravalid1acjrk7dhkd5tpal0m0rytsfytg5r9vc67y02v6fnv4qvrcr2kqxqgyn9wy';
const inactiveValidator2InfoResponse = new ValidatorInfoResponse({
  validatorInfo: {
    validator: {
      name: 'Inactive validator 2',
      identityKey: asIdentityKey(inactiveValidator2Bech32IdentityKey),
    },
    status: {
      state: { state: ValidatorState_ValidatorStateEnum.INACTIVE },
    },
  },
});

const MOCK_ALL_VALIDATOR_INFOS = [
  activeValidatorInfoResponse,
  activeValidator2InfoResponse,
  inactiveValidatorInfoResponse,
  inactiveValidator2InfoResponse,
];

const MOCK_ACTIVE_VALIDATOR_INFOS = [activeValidatorInfoResponse, activeValidator2InfoResponse];

const penumbraBalancesResponse = new BalancesResponse({
  accountAddress: {
    addressView: {
      case: 'decoded',
      value: {
        index: { account: 0 },
      },
    },
  },
  balanceView: {
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: { hi: 0n, lo: 1n },
        metadata: STAKING_TOKEN_METADATA,
      },
    },
  },
});

const activeValidatorBalancesResponse = new BalancesResponse({
  accountAddress: {
    addressView: {
      case: 'decoded',
      value: {
        index: { account: 0 },
      },
    },
  },
  balanceView: {
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: { hi: 0n, lo: 2n },
        metadata: {
          base: `udelegation_${activeValidatorBech32IdentityKey}`,
          display: `delegation_${activeValidatorBech32IdentityKey}`,
        },
      },
    },
  },
});

const inactiveValidatorBalancesResponse = new BalancesResponse({
  accountAddress: {
    addressView: {
      case: 'decoded',
      value: {
        index: { account: 0 },
      },
    },
  },
  balanceView: {
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: { hi: 0n, lo: 3n },
        metadata: {
          base: `udelegation_${inactiveValidatorBech32IdentityKey}`,
          display: `delegation_${inactiveValidatorBech32IdentityKey}`,
        },
      },
    },
  },
});

const MOCK_BALANCES = [
  penumbraBalancesResponse,
  activeValidatorBalancesResponse,
  inactiveValidatorBalancesResponse,
];

describe('DelegationsByAddressIndex request handler', () => {
  const mockStakingClient = {
    validatorInfo: vi.fn(),
  };
  let mockCtx: HandlerContext;

  const mockBalancesResponse = {
    next: vi.fn(),
    [Symbol.asyncIterator]: () => mockBalancesResponse,
  };

  const mockAllValidatorInfosResponse = {
    next: vi.fn(),
    [Symbol.asyncIterator]: () => mockAllValidatorInfosResponse,
  };

  const mockActiveValidatorInfosResponse = {
    next: vi.fn(),
    [Symbol.asyncIterator]: () => mockActiveValidatorInfosResponse,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockBalances.mockReturnValue(mockBalancesResponse);
    MOCK_BALANCES.forEach(value => mockBalancesResponse.next.mockResolvedValueOnce({ value }));
    mockBalancesResponse.next.mockResolvedValueOnce({ done: true });

    // Miniature mock staking client that actually switches what response it
    // gives based on `req.showInactive`.
    mockStakingClient.validatorInfo.mockImplementation((req: ValidatorInfoRequest) =>
      req.showInactive ? mockAllValidatorInfosResponse : mockActiveValidatorInfosResponse,
    );
    MOCK_ALL_VALIDATOR_INFOS.forEach(value =>
      mockAllValidatorInfosResponse.next.mockResolvedValueOnce({ value }),
    );
    mockAllValidatorInfosResponse.next.mockResolvedValueOnce({ done: true });
    MOCK_ACTIVE_VALIDATOR_INFOS.forEach(value =>
      mockActiveValidatorInfosResponse.next.mockResolvedValueOnce({ value }),
    );
    mockActiveValidatorInfosResponse.next.mockResolvedValueOnce({ done: true });

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.fMDParameters,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(
        stakingClientCtx,
        mockStakingClient as unknown as PromiseClient<typeof StakingService>,
      ),
    });
  });

  it("includes the address's balance in the `ValueView` for delegation tokens the address holds", async () => {
    const results: (
      | DelegationsByAddressIndexResponse
      | PartialMessage<DelegationsByAddressIndexResponse>
    )[] = [];

    for await (const result of delegationsByAddressIndex(
      new DelegationsByAddressIndexRequest({ addressIndex: { account: 0 } }),
      mockCtx,
    )) {
      results.push(result);
    }

    const firstValueView = new ValueView(results[0]!.valueView);

    expect(getAmount(firstValueView)).toEqual({ hi: 0n, lo: 2n });
  });

  it("includes `ValidatorInfo` in the `ValueView`'s `extendedMetadata` property", async () => {
    const results: (
      | DelegationsByAddressIndexResponse
      | PartialMessage<DelegationsByAddressIndexResponse>
    )[] = [];

    for await (const result of delegationsByAddressIndex(
      new DelegationsByAddressIndexRequest({ addressIndex: { account: 0 } }),
      mockCtx,
    )) {
      results.push(result);
    }

    const firstValueView = new ValueView(results[0]!.valueView);
    const validatorInfo = getValidatorInfoFromValueView(firstValueView);

    expect(validatorInfo.toJson()).toEqual(activeValidatorInfoResponse.validatorInfo!.toJson());
  });

  describe('when no filter option is passed', () => {
    it('returns one `ValueView` for each active validator', async () => {
      const results: (
        | DelegationsByAddressIndexResponse
        | PartialMessage<DelegationsByAddressIndexResponse>
      )[] = [];

      for await (const result of delegationsByAddressIndex(
        new DelegationsByAddressIndexRequest({ addressIndex: { account: 0 } }),
        mockCtx,
      )) {
        results.push(result);
      }

      expect(results.length).toBe(2);
    });

    it('returns a zero-balance `ValueView` for validators the address has no tokens for', async () => {
      const results: (
        | DelegationsByAddressIndexResponse
        | PartialMessage<DelegationsByAddressIndexResponse>
      )[] = [];

      for await (const result of delegationsByAddressIndex(
        new DelegationsByAddressIndexRequest({ addressIndex: { account: 0 } }),
        mockCtx,
      )) {
        results.push(result);
      }

      const secondValueView = new ValueView(results[1]!.valueView);

      expect(getAmount(secondValueView)).toEqual({ hi: 0n, lo: 0n });
    });
  });

  describe('when the nonzero balances filter option is passed', () => {
    it('returns one `ValueView` for each validator the address has tokens for', async () => {
      const results: (
        | DelegationsByAddressIndexResponse
        | PartialMessage<DelegationsByAddressIndexResponse>
      )[] = [];

      for await (const result of delegationsByAddressIndex(
        new DelegationsByAddressIndexRequest({
          addressIndex: { account: 0 },
          filter: DelegationsByAddressIndexRequest_Filter.ALL_ACTIVE_WITH_NONZERO_BALANCES,
        }),
        mockCtx,
      )) {
        results.push(result);
      }

      expect(results.length).toBe(1);
    });
  });

  describe('when the `ALL` filter option is passed', () => {
    it.todo('returns one `ValueView` for each validator, including inactive ones');
  });
});
