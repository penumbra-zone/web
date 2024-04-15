import {
  AppParametersResponse,
  BalancesResponse,
  StatusResponse,
  UnbondingTokensByAddressIndexRequest,
  UnbondingTokensByAddressIndexRequest_Filter,
  UnbondingTokensByAddressIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { createHandlerContext } from '@connectrpc/connect';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unbondingTokensByAddressIndex } from '.';
import { STAKING_TOKEN, STAKING_TOKEN_METADATA } from '@penumbra-zone/constants/src/assets';
import Array from '@penumbra-zone/polyfills/src/Array.fromAsync';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/src/value-view';

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

const mockCtx = createHandlerContext({
  service: ViewService,
  method: ViewService.methods.unbondingTokensByAddressIndex,
  protocolName: 'mock',
  requestMethod: 'MOCK',
  url: '/mock',
});

const mockBalancesResponse1 = new BalancesResponse({
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

const mockBalancesResponse2 = new BalancesResponse({
  balanceView: {
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: { hi: 0n, lo: 2n },
        metadata: {
          display: 'unbonding_start_at_100_penumbravalid1abc123',
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
          display: 'unbonding_start_at_200_penumbravalid1abc123',
        },
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
    expect(getDisplayDenomFromView(responseObjects[0]!.valueView)).not.toBe(STAKING_TOKEN);
    expect(getDisplayDenomFromView(responseObjects[1]!.valueView)).not.toBe(STAKING_TOKEN);
  });
});
