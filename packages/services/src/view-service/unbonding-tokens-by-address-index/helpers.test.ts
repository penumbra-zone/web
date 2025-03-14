import { describe, expect, it, vi } from 'vitest';
import { create } from '@bufbuild/protobuf';
import { getIsClaimable } from './helpers.js';
import {
  AppParametersResponseSchema,
  BalancesResponseSchema,
  StatusResponseSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { createHandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';

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
  method: ViewService.method.unbondingTokensByAddressIndex,
  protocolName: 'mock',
  requestMethod: 'MOCK',
  url: '/mock',
});

describe('getIsClaimable()', () => {
  it("returns `true` when we've passed the unbonding delay period", async () => {
    mockAppParameters.mockResolvedValue(
      create(AppParametersResponseSchema, {
        parameters: {
          stakeParams: {
            unbondingDelay: 100n,
          },
        },
      }),
    );

    mockStatus.mockResolvedValue(
      create(StatusResponseSchema, {
        fullSyncHeight: 200n,
      }),
    );

    const balancesResponse = create(BalancesResponseSchema, {
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
      create(AppParametersResponseSchema, {
        parameters: {
          stakeParams: {
            unbondingDelay: 100n,
          },
        },
      }),
    );

    mockStatus.mockResolvedValue(
      create(StatusResponseSchema, {
        fullSyncHeight: 200n,
      }),
    );

    const balancesResponse = create(BalancesResponseSchema, {
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
