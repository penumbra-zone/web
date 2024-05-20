import { describe, expect, it, vi } from 'vitest';
import { assembleScheduleRequest } from './assemble-schedule-request';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

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
  accountAddress: {
    addressView: {
      case: 'decoded',
      value: {
        index: {
          account: 1234,
        },
      },
    },
  },
});

const ARGS: Parameters<typeof assembleScheduleRequest>[0] = {
  amount: '123',
  duration: '10min',
  minOutput: '1',
  maxOutput: '1000',
  assetIn: balancesResponse,
  assetOut: metadata,
};

describe('assembleScheduleRequest()', () => {
  it('uses the correct source for the transaction', async () => {
    const req = await assembleScheduleRequest(ARGS);

    expect(req.source).toEqual(new AddressIndex({ account: 1234 }));
  });
});
