import { describe, expect, it, vi } from 'vitest';
import { assembleRequest } from './assemble-request';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { BLOCKS_PER_MINUTE, DURATION_IN_BLOCKS } from './constants';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';

const MOCK_START_HEIGHT = vi.hoisted(() => 1234n);

const mockViewClient = vi.hoisted(() => ({
  status: () => Promise.resolve({ fullSyncHeight: MOCK_START_HEIGHT }),
}));

vi.mock('../../clients', () => ({
  viewClient: mockViewClient,
}));

const metadata = new Metadata({
  base: 'uasset',
  display: 'asset',
  denomUnits: [
    {
      denom: 'uasset',
      exponent: 0,
    },
    {
      denom: 'asset',
      exponent: 6,
    },
  ],
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
      MOCK_START_HEIGHT + BLOCKS_PER_MINUTE + DURATION_IN_BLOCKS['10min'],
    );

    const req2 = await assembleRequest({ ...ARGS, duration: '48h' });

    expect(req2.dutchAuctionScheduleActions[0]!.description!.startHeight).toBe(
      MOCK_START_HEIGHT + BLOCKS_PER_MINUTE,
    );
    expect(req2.dutchAuctionScheduleActions[0]!.description!.endHeight).toBe(
      MOCK_START_HEIGHT + BLOCKS_PER_MINUTE + DURATION_IN_BLOCKS['48h'],
    );
  });

  it('uses a step count of 120', async () => {
    const req = await assembleRequest(ARGS);

    expect(req.dutchAuctionScheduleActions[0]!.description!.stepCount).toBe(120n);
  });

  it('correctly parses the input based on the display denom exponent', async () => {
    const req = await assembleRequest(ARGS);

    expect(req.dutchAuctionScheduleActions[0]!.description!.input?.amount).toEqual(
      new Amount({ hi: 0n, lo: 123_000_000n }),
    );
  });

  it('correctly parses the min/max outputs based on the display denom exponent', async () => {
    const req = await assembleRequest(ARGS);

    expect(req.dutchAuctionScheduleActions[0]!.description!.minOutput).toEqual(
      new Amount({ hi: 0n, lo: 1_000_000n }),
    );
    expect(req.dutchAuctionScheduleActions[0]!.description!.maxOutput).toEqual(
      new Amount({ hi: 0n, lo: 1_000_000_000n }),
    );
  });
});
