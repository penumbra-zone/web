import { describe, expect, it, vi } from 'vitest';
import { assembleRequest } from './assemble-request';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { BLOCKS_PER_MINUTE, DURATION_IN_BLOCKS } from './constants';

const MOCK_START_HEIGHT = vi.hoisted(() => 1234n);

const mockViewClient = vi.hoisted(() => ({
  status: () => Promise.resolve({ fullSyncHeight: MOCK_START_HEIGHT }),
}));

vi.mock('../../clients', () => ({
  viewClient: mockViewClient,
}));

const metadata = new Metadata({
  penumbraAssetId: {},
});

const balancesResponse = new BalancesResponse({
  balanceView: {
    valueView: {
      case: 'knownAssetId',
      value: {
        metadata,
      },
    },
  },
});

const ARGS: Parameters<typeof assembleRequest>[0] = {
  amount: '123',
  duration: '10min',
  minOutput: '1',
  maxOutput: '1000',
  assetIn: balancesResponse,
  assetOut: metadata,
};

describe('assembleRequest()', () => {
  it('correctly converts durations to block heights', async () => {
    const req = await assembleRequest({ ...ARGS, duration: '10min' });

    expect(req.dutchAuctionScheduleActions[0]!.description!.startHeight).toBe(
      MOCK_START_HEIGHT + BLOCKS_PER_MINUTE,
    );
    expect(req.dutchAuctionScheduleActions[0]!.description!.endHeight).toBe(
      MOCK_START_HEIGHT + BLOCKS_PER_MINUTE + DURATION_IN_BLOCKS.get('10min')!,
    );

    const req2 = await assembleRequest({ ...ARGS, duration: '48h' });

    expect(req2.dutchAuctionScheduleActions[0]!.description!.startHeight).toBe(
      MOCK_START_HEIGHT + BLOCKS_PER_MINUTE,
    );
    expect(req2.dutchAuctionScheduleActions[0]!.description!.endHeight).toBe(
      MOCK_START_HEIGHT + BLOCKS_PER_MINUTE + DURATION_IN_BLOCKS.get('48h')!,
    );
  });
});
