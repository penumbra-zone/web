import { beforeEach, describe, expect, it, vi } from 'vitest';
import { delegationsByAddressIndex } from './delegations-by-address-index.js';
import { StakeService, ViewService } from '@penumbra-zone/protobuf';
import {
  createContextValues,
  createHandlerContext,
  HandlerContext,
  PromiseClient,
} from '@connectrpc/connect';
import { stakeClientCtx } from '../ctx/stake-client.js';
import {
  AssetMetadataByIdResponse,
  BalancesResponse,
  DelegationsByAddressIndexRequest,
  DelegationsByAddressIndexRequest_Filter,
  DelegationsByAddressIndexResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  ValidatorInfoRequest,
  ValidatorInfoResponse,
  ValidatorState_ValidatorStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { getAmount, getValidatorInfoFromValueView } from '@penumbra-zone/getters/value-view';
import { identityKeyFromBech32m } from '@penumbra-zone/bech32m/penumbravalid';
import { Any, PartialMessage } from '@bufbuild/protobuf';
import {
  Metadata,
  ValueView,
  ValueView_KnownAssetId,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

vi.mock('@penumbra-zone/wasm/metadata', () => ({
  customizeSymbol: (metadata: Metadata) => metadata,
}));

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
      identityKey: identityKeyFromBech32m(activeValidatorBech32IdentityKey),
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
      identityKey: identityKeyFromBech32m(activeValidator2Bech32IdentityKey),
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
      identityKey: identityKeyFromBech32m(inactiveValidatorBech32IdentityKey),
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
const jailedValidatorInfoResponse = new ValidatorInfoResponse({
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
        metadata: {},
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

const jailedValidatorBalancesResponse = new BalancesResponse({
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

  describe('only active/inactive responses', () => {
    beforeEach(() => {
      vi.resetAllMocks();

      mockBalances.mockImplementation(async function* () {
        yield* await Promise.resolve(MOCK_BALANCES);
      });

      mockStakeClient.validatorInfo.mockImplementation(async function* (req: ValidatorInfoRequest) {
        yield* await Promise.resolve(
          req.showInactive ? MOCK_ALL_VALIDATOR_INFOS : MOCK_ACTIVE_VALIDATOR_INFOS,
        );
      });

      mockCtx = createHandlerContext({
        service: ViewService,
        method: ViewService.methods.fMDParameters,
        protocolName: 'mock',
        requestMethod: 'MOCK',
        url: '/mock',
        contextValues: createContextValues().set(
          stakeClientCtx,
          mockStakeClient as unknown as PromiseClient<typeof StakeService>,
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
      it('returns one `ValueView` for each validator, including inactive ones', async () => {
        const results: (
          | DelegationsByAddressIndexResponse
          | PartialMessage<DelegationsByAddressIndexResponse>
        )[] = [];

        for await (const result of delegationsByAddressIndex(
          new DelegationsByAddressIndexRequest({
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

      mockBalances.mockImplementation(async function* () {
        yield* await Promise.resolve([...MOCK_BALANCES, jailedValidatorBalancesResponse]);
      });

      mockStakeClient.validatorInfo.mockImplementation(async function* () {
        yield* await Promise.resolve([...MOCK_ALL_VALIDATOR_INFOS, jailedValidatorInfoResponse]);
      });

      mockCtx = createHandlerContext({
        service: ViewService,
        method: ViewService.methods.fMDParameters,
        protocolName: 'mock',
        requestMethod: 'MOCK',
        url: '/mock',
        contextValues: createContextValues().set(
          stakeClientCtx,
          mockStakeClient as unknown as PromiseClient<typeof StakeService>,
        ),
      });
    });

    it('returns the jailed balance back', async () => {
      const results: (
        | DelegationsByAddressIndexResponse
        | PartialMessage<DelegationsByAddressIndexResponse>
      )[] = [];

      for await (const result of delegationsByAddressIndex(
        new DelegationsByAddressIndexRequest({
          addressIndex: { account: 0 },
          filter: DelegationsByAddressIndexRequest_Filter.ALL,
        }),
        mockCtx,
      )) {
        results.push(result);
      }

      // balance augmented with extended metadata of validator info
      const expectedResponse = new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: jailedValidatorBalancesResponse.balanceView!.valueView.value!.amount,
            metadata: (
              jailedValidatorBalancesResponse.balanceView!.valueView.value as ValueView_KnownAssetId
            ).metadata,
            extendedMetadata: Any.pack(jailedValidatorInfoResponse.validatorInfo!),
          },
        },
      });

      expect((results[4]!.valueView! as ValueView).equals(expectedResponse)).toBeTruthy();

      expect(results.length).toBe(5);
    });
  });
});
