import { describe, expect, it, vi } from 'vitest';
import { getIsClaimable } from './helpers';
import {
  AppParametersResponse,
  BalancesResponse,
  StatusResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createHandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';

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

describe('getIsClaimable()', () => {
  it("returns `true` when we've passed the unbonding delay period", async () => {
    mockAppParameters.mockResolvedValue(
      new AppParametersResponse({
        parameters: {
          stakeParams: {
            unbondingDelay: 100n,
          },
        },
      }),
    );

    mockStatus.mockResolvedValue(
      new StatusResponse({
        fullSyncHeight: 200n,
      }),
    );

    const balancesResponse = new BalancesResponse({
      balanceView: {
        valueView: {
          case: 'knownAssetId',
          value: {
            metadata: {
              display: 'unbonding_start_at_100_penumbravalid1abc123',
            },
          },
        },
      },
    });

    await expect(getIsClaimable(balancesResponse, mockCtx)).resolves.toBe(true);
  });

  it("returns `false` when we haven't yet passed the unbonding delay period", async () => {
    mockAppParameters.mockResolvedValue(
      new AppParametersResponse({
        parameters: {
          stakeParams: {
            unbondingDelay: 100n,
          },
        },
      }),
    );

    mockStatus.mockResolvedValue(
      new StatusResponse({
        fullSyncHeight: 200n,
      }),
    );

    const balancesResponse = new BalancesResponse({
      balanceView: {
        valueView: {
          case: 'knownAssetId',
          value: {
            metadata: {
              display: 'unbonding_start_at_150_penumbravalid1abc123',
            },
          },
        },
      },
    });

    await expect(getIsClaimable(balancesResponse, mockCtx)).resolves.toBe(false);
  });
});
