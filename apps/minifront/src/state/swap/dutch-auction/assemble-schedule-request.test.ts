import { describe, expect, it, vi } from 'vitest';
import { assembleScheduleRequest } from './assemble-schedule-request';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

const MOCK_START_HEIGHT = vi.hoisted(() => 1234n);

const hoisted = vi.hoisted(() => ({
  mockViewClient: {
    status: () => Promise.resolve({ fullSyncHeight: MOCK_START_HEIGHT }),
  },
}));

vi.mock('../../../prax', () => ({
  penumbra: {
    service: vi.fn(() => hoisted.mockViewClient),
  },
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
