import {
  AppParametersResponse,
  BalancesResponse,
  StatusResponse,
  UnbondingTokensByAddressIndexRequest,
  UnbondingTokensByAddressIndexRequest_Filter,
  UnbondingTokensByAddressIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { createContextValues, createHandlerContext, PromiseClient } from '@connectrpc/connect';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unbondingTokensByAddressIndex } from '.';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';
import { StakeService } from '@penumbra-zone/protobuf';
import { stakeClientCtx } from '../../ctx/stake-client';
import { ValidatorInfoResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';

const mockBalances = vi.hoisted(() => vi.fn());
vi.mock('../balances', () => ({
  balances: mockBalances,
}));

const mockAppParameters = vi.hoisted(() => vi.fn());
vi.mock('../app-parameters', () => ({
  appParameters: mockAppParameters,
}));

const mockStatus = vi.hoisted(() => vi.fn());
vi.mock('../status', () => ({
  status: mockStatus,
}));

const mockStakingClient = {
  getValidatorInfo: vi.fn(),
};

const mockCtx = createHandlerContext({
  service: ViewService,
  method: ViewService.methods.unbondingTokensByAddressIndex,
  protocolName: 'mock',
  requestMethod: 'MOCK',
  url: '/mock',
  contextValues: createContextValues().set(
    stakeClientCtx,
    mockStakingClient as unknown as PromiseClient<typeof StakeService>,
  ),
});

const mockBalancesResponse1 = new BalancesResponse({
  balanceView: {
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: { hi: 0n, lo: 1n },
        metadata: {
          display: 'penumbra',
        },
      },
    },
  },
});

const mockBalancesResponse2 = new BalancesResponse({
  balanceView: {
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: { hi: 0n, lo: 2n },
        metadata: {
          display:
            'unbonding_start_at_100_penumbravalid1u2z9c75xcc2ny6jxccge6ehqtqkhgy4ltxms3ldappr06ekpguxqq48pdh',
        },
      },
    },
  },
});

const mockBalancesResponse3 = new BalancesResponse({
  balanceView: {
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: { hi: 0n, lo: 3n },
        metadata: {
          display:
            'unbonding_start_at_200_penumbravalid1ltltrqe7f2c0q8mqlsx3u74s0r6nm968f325njz4h8zzqh0gsgfq2g5d3m',
        },
      },
    },
  },
});

const mockBalancesResponse4 = new BalancesResponse({
  balanceView: {
    valueView: {
      case: 'unknownAssetId',
      value: {
        amount: { hi: 0n, lo: 3n },
      },
    },
  },
});

describe('Unbonding Tokens by Address Index handler', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockAppParameters.mockResolvedValue(
      new AppParametersResponse({ parameters: { stakeParams: { unbondingDelay: 100n } } }),
    );

    mockStakingClient.getValidatorInfo.mockResolvedValue(
      new ValidatorInfoResponse({
        validatorInfo: {
          validator: {
            name: 'Validator 1',
          },
        },
      }),
    );
    mockStatus.mockResolvedValue(new StatusResponse({ fullSyncHeight: 250n }));

    const mockBalancesResponse = {
      next: vi.fn(),
      [Symbol.asyncIterator]: () => mockBalancesResponse,
    };
    mockBalancesResponse.next.mockResolvedValueOnce({
      value: mockBalancesResponse1,
    });
    mockBalancesResponse.next.mockResolvedValueOnce({
      value: mockBalancesResponse2,
    });
    mockBalancesResponse.next.mockResolvedValueOnce({
      value: mockBalancesResponse3,
    });
    mockBalancesResponse.next.mockResolvedValueOnce({
      value: mockBalancesResponse4,
    });
    mockBalancesResponse.next.mockResolvedValueOnce({ done: true });

    mockBalances.mockReturnValue(mockBalancesResponse);
  });

  describe('when passed no filter', () => {
    it('returns all unbonding tokens, along with their claimable status', async () => {
      const responses = await Array.fromAsync(
        unbondingTokensByAddressIndex(new UnbondingTokensByAddressIndexRequest(), mockCtx),
      );

      expect(responses.length).toBe(2);
      expect(responses[0]!.claimable).toBeTypeOf('boolean');
      expect(responses[1]!.claimable).toBeTypeOf('boolean');
    });
  });

  describe('when filtering only for claimable tokens', () => {
    it('returns only claimable unbonding tokens', async () => {
      const responses = await Array.fromAsync(
        unbondingTokensByAddressIndex(
          new UnbondingTokensByAddressIndexRequest({
            filter: UnbondingTokensByAddressIndexRequest_Filter.CLAIMABLE,
          }),
          mockCtx,
        ),
      );

      expect(responses.length).toBe(1);
      expect(responses[0]!.claimable).toBe(true);
    });
  });

  describe('when filtering only for not-yet-claimable tokens', () => {
    it('returns only not-yet-claimable unbonding tokens', async () => {
      const responses = await Array.fromAsync(
        unbondingTokensByAddressIndex(
          new UnbondingTokensByAddressIndexRequest({
            filter: UnbondingTokensByAddressIndexRequest_Filter.NOT_YET_CLAIMABLE,
          }),
          mockCtx,
        ),
      );

      expect(responses.length).toBe(1);
      expect(responses[0]!.claimable).toBe(false);
    });
  });

  it("excludes any tokens that aren't unbonding tokens", async () => {
    const responses = await Array.fromAsync(
      unbondingTokensByAddressIndex(new UnbondingTokensByAddressIndexRequest(), mockCtx),
    );
    const responseObjects = responses.map(
      response => new UnbondingTokensByAddressIndexResponse(response),
    );

    expect(responses.length).toBe(2);
    expect(getDisplayDenomFromView(responseObjects[0]!.valueView)).not.toBe('penumbra');
    expect(getDisplayDenomFromView(responseObjects[1]!.valueView)).not.toBe('penumbra');
  });
});
