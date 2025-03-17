import { beforeEach, describe, expect, it, vi } from 'vitest';
import { delegationsByAddressIndex } from './delegations-by-address-index.js';
import { StakeService, ViewService } from '@penumbra-zone/protobuf';
import {
  createContextValues,
  createHandlerContext,
  HandlerContext,
  Client,
} from '@connectrpc/connect';
import { stakeClientCtx } from '../ctx/stake-client.js';

import {
  AssetMetadataByIdResponseSchema,
  BalancesResponseSchema,
  DelegationsByAddressIndexRequestSchema,
  DelegationsByAddressIndexRequest_Filter,
  DelegationsByAddressIndexResponse,
  DelegationsByAddressIndexResponseSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import {
  ValidatorInfoRequest,
  ValidatorInfoResponseSchema,
  ValidatorInfoSchema,
  ValidatorState_ValidatorStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';

import { getAmount, getValidatorInfoFromValueView } from '@penumbra-zone/getters/value-view';
import { identityKeyFromBech32m } from '@penumbra-zone/bech32m/penumbravalid';
import { create, equals, MessageInitShape, toJson } from '@bufbuild/protobuf';
import {
  MetadataSchema,
  ValueViewSchema,
  ValueView_KnownAssetId,
  Metadata,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { anyPack } from '@bufbuild/protobuf/wkt';
import { AmountSchema } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';

vi.mock('@penumbra-zone/wasm/metadata', () => ({
  customizeSymbol: (metadata: Metadata) => metadata,
}));

const mockBalances = vi.hoisted(() => vi.fn());
vi.mock('./balances', () => ({
  balances: mockBalances,
}));

vi.mock('./asset-metadata-by-id', () => ({
  assetMetadataById: () =>
    Promise.resolve(
      create(AssetMetadataByIdResponseSchema, { denomMetadata: create(MetadataSchema) }),
    ),
}));

const activeValidatorBech32IdentityKey =
  'penumbravalid1zpwtnnmeu2fdqx9dslmd5sc44rja4jqlzqvzel8tajkk6ur7jyqq0cgcy9';
const activeValidatorInfoResponse = create(ValidatorInfoResponseSchema, {
  validatorInfo: {
    validator: {
      name: 'Active validator',
      identityKey: identityKeyFromBech32m(activeValidatorBech32IdentityKey),
    },
    status: {
      state: { state: ValidatorState_ValidatorStateEnum.ACTIVE },
    },
  },
});

const activeValidator2Bech32IdentityKey =
  'penumbravalid1tnsyu4tppg7rwgyl3wwcfxwfq6g6ahmlyywqvt77a2zlx6s34qpsxxh7qm';
const activeValidator2InfoResponse = create(ValidatorInfoResponseSchema, {
  validatorInfo: {
    validator: {
      name: 'Active validator 2',
      identityKey: identityKeyFromBech32m(activeValidator2Bech32IdentityKey),
    },
    status: {
      state: { state: ValidatorState_ValidatorStateEnum.ACTIVE },
    },
  },
});

const inactiveValidatorBech32IdentityKey =
  'penumbravalid1r6ja22cl476tluzea3w07r8kxl46ppqlckcvyzslg3ywsmqdnyys86t55e';
const inactiveValidatorInfoResponse = create(ValidatorInfoResponseSchema, {
  validatorInfo: {
    validator: {
      name: 'Inactive validator',
      identityKey: identityKeyFromBech32m(inactiveValidatorBech32IdentityKey),
    },
    status: {
      state: { state: ValidatorState_ValidatorStateEnum.INACTIVE },
    },
  },
});

const inactiveValidator2Bech32IdentityKey =
  'penumbravalid1acjrk7dhkd5tpal0m0rytsfytg5r9vc67y02v6fnv4qvrcr2kqxqgyn9wy';
const inactiveValidator2InfoResponse = create(ValidatorInfoResponseSchema, {
  validatorInfo: {
    validator: {
      name: 'Inactive validator 2',
      identityKey: identityKeyFromBech32m(inactiveValidator2Bech32IdentityKey),
    },
    status: {
      state: { state: ValidatorState_ValidatorStateEnum.INACTIVE },
    },
  },
});

// udelegation_penumbravalid163d86qvg7c6fv33a2rqfxdr4xjjst9xg49exup0x9g9t9plnm5qqcvjyyp
const jailedValidatorBech32IdentityKey =
  'penumbravalid1mr4j6nh3za3wjptjr2uj2ssr3fg0gxxqgqg9vgjl7luqa3qur5zs3fj5w6';
const jailedValidatorInfoResponse = create(ValidatorInfoResponseSchema, {
  validatorInfo: {
    validator: {
      name: 'Jailed validator',
      identityKey: identityKeyFromBech32m(jailedValidatorBech32IdentityKey),
    },
    status: {
      state: { state: ValidatorState_ValidatorStateEnum.JAILED },
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

const penumbraBalancesResponse = create(BalancesResponseSchema, {
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
        metadata: {},
      },
    },
  },
});

const activeValidatorBalancesResponse = create(BalancesResponseSchema, {
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

const inactiveValidatorBalancesResponse = create(BalancesResponseSchema, {
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

const jailedValidatorBalancesResponse = create(BalancesResponseSchema, {
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
        amount: { hi: 0n, lo: 4738495n },
        metadata: {
          base: `udelegation_${jailedValidatorBech32IdentityKey}`,
          display: `delegation_${jailedValidatorBech32IdentityKey}`,
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
  const mockStakeClient = {
    validatorInfo: vi.fn(),
    getValidatorInfo: vi.fn(),
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

  describe('only active/inactive responses', () => {
    beforeEach(() => {
      vi.resetAllMocks();
      mockBalances.mockReturnValue(mockBalancesResponse);
      MOCK_BALANCES.forEach(value => mockBalancesResponse.next.mockResolvedValueOnce({ value }));
      mockBalancesResponse.next.mockResolvedValueOnce({ done: true });

      // Miniature mock staking client that actually switches what response it
      // gives based on `req.showInactive`.
      mockStakeClient.validatorInfo.mockImplementation((req: ValidatorInfoRequest) =>
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
        method: ViewService.method.fMDParameters,
        protocolName: 'mock',
        requestMethod: 'MOCK',
        url: '/mock',
        contextValues: createContextValues().set(
          stakeClientCtx,
          mockStakeClient as unknown as Client<typeof StakeService>,
        ),
      });
    });

    it("includes the address's balance in the `ValueView` for delegation tokens the address holds", async () => {
      const results: (
        | DelegationsByAddressIndexResponse
        | MessageInitShape<typeof DelegationsByAddressIndexResponseSchema>
      )[] = [];

      for await (const result of delegationsByAddressIndex(
        create(DelegationsByAddressIndexRequestSchema, { addressIndex: { account: 0 } }),
        mockCtx,
      )) {
        results.push(result);
      }

      const firstValueView = create(ValueViewSchema, results[0]!.valueView);

      expect(getAmount(firstValueView)).toEqual(create(AmountSchema, { hi: 0n, lo: 2n }));
    });

    it("includes `ValidatorInfo` in the `ValueView`'s `extendedMetadata` property", async () => {
      const results: (
        | DelegationsByAddressIndexResponse
        | MessageInitShape<typeof DelegationsByAddressIndexResponseSchema>
      )[] = [];

      for await (const result of delegationsByAddressIndex(
        create(DelegationsByAddressIndexRequestSchema, { addressIndex: { account: 0 } }),
        mockCtx,
      )) {
        results.push(result);
      }

      const firstValueView = create(ValueViewSchema, results[0]!.valueView);
      const validatorInfo = getValidatorInfoFromValueView(firstValueView);

      expect(toJson(ValidatorInfoSchema, validatorInfo)).toEqual(
        toJson(ValidatorInfoSchema, activeValidatorInfoResponse.validatorInfo!),
      );
    });

    describe('when no filter option is passed', () => {
      it('returns one `ValueView` for each active validator', async () => {
        const results: (
          | DelegationsByAddressIndexResponse
          | MessageInitShape<typeof DelegationsByAddressIndexResponseSchema>
        )[] = [];

        for await (const result of delegationsByAddressIndex(
          create(DelegationsByAddressIndexRequestSchema, { addressIndex: { account: 0 } }),
          mockCtx,
        )) {
          results.push(result);
        }

        expect(results.length).toBe(2);
      });

      it('returns a zero-balance `ValueView` for validators the address has no tokens for', async () => {
        const results: (
          | DelegationsByAddressIndexResponse
          | MessageInitShape<typeof DelegationsByAddressIndexResponseSchema>
        )[] = [];

        for await (const result of delegationsByAddressIndex(
          create(DelegationsByAddressIndexRequestSchema, { addressIndex: { account: 0 } }),
          mockCtx,
        )) {
          results.push(result);
        }

        const secondValueView = create(ValueViewSchema, results[1]!.valueView);

        expect(getAmount(secondValueView)).toEqual(create(AmountSchema, { hi: 0n, lo: 0n }));
      });
    });

    describe('when the nonzero balances filter option is passed', () => {
      it('returns one `ValueView` for each validator the address has tokens for', async () => {
        const results: (
          | DelegationsByAddressIndexResponse
          | MessageInitShape<typeof DelegationsByAddressIndexResponseSchema>
        )[] = [];

        for await (const result of delegationsByAddressIndex(
          create(DelegationsByAddressIndexRequestSchema, {
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
      it('returns one `ValueView` for each validator, including inactive ones', async () => {
        const results: (
          | DelegationsByAddressIndexResponse
          | MessageInitShape<typeof DelegationsByAddressIndexResponseSchema>
        )[] = [];

        for await (const result of delegationsByAddressIndex(
          create(DelegationsByAddressIndexRequestSchema, {
            addressIndex: { account: 0 },
            filter: DelegationsByAddressIndexRequest_Filter.ALL,
          }),
          mockCtx,
        )) {
          results.push(result);
        }

        expect(results.length).toBe(4);
      });
    });
  });

  describe('when user has a jailed validator it its balances', () => {
    beforeEach(() => {
      vi.resetAllMocks();
      mockBalances.mockReturnValue(mockBalancesResponse);
      [...MOCK_BALANCES, jailedValidatorBalancesResponse].forEach(value =>
        mockBalancesResponse.next.mockResolvedValueOnce({ value }),
      );
      mockBalancesResponse.next.mockResolvedValueOnce({ done: true });

      mockStakeClient.validatorInfo.mockReturnValue(mockAllValidatorInfosResponse);

      [...MOCK_ALL_VALIDATOR_INFOS, jailedValidatorInfoResponse].forEach(value =>
        mockAllValidatorInfosResponse.next.mockResolvedValueOnce({ value }),
      );
      mockAllValidatorInfosResponse.next.mockResolvedValueOnce({ done: true });

      mockCtx = createHandlerContext({
        service: ViewService,
        method: ViewService.method.fMDParameters,
        protocolName: 'mock',
        requestMethod: 'MOCK',
        url: '/mock',
        contextValues: createContextValues().set(
          stakeClientCtx,
          mockStakeClient as unknown as Client<typeof StakeService>,
        ),
      });
    });

    it('returns the jailed balance back', async () => {
      const results: (
        | DelegationsByAddressIndexResponse
        | MessageInitShape<typeof DelegationsByAddressIndexResponseSchema>
      )[] = [];

      for await (const result of delegationsByAddressIndex(
        create(DelegationsByAddressIndexRequestSchema, {
          addressIndex: { account: 0 },
          filter: DelegationsByAddressIndexRequest_Filter.ALL,
        }),
        mockCtx,
      )) {
        results.push(result);
      }

      // balance augmented with extended metadata of validator info
      const expectedResponse = create(ValueViewSchema, {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: jailedValidatorBalancesResponse.balanceView!.valueView.value!.amount,
            metadata: (
              jailedValidatorBalancesResponse.balanceView!.valueView.value as ValueView_KnownAssetId
            ).metadata,
            extendedMetadata: anyPack(
              ValidatorInfoSchema,
              jailedValidatorInfoResponse.validatorInfo!,
            ),
          },
        },
      });

      expect(
        equals(ValueViewSchema, results[4]!.valueView! as ValueView, expectedResponse),
      ).toBeTruthy();
      expect(results.length).toBe(5);
    });
  });
});
