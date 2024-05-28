import { describe, expect, it, vi } from 'vitest';
import { getSubAuctions } from './get-sub-auctions';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';

const MOCK_START_HEIGHT = vi.hoisted(() => 1234n);

const mockViewClient = vi.hoisted(() => ({
  status: () => Promise.resolve({ fullSyncHeight: MOCK_START_HEIGHT }),
}));

vi.mock('../../../clients', () => ({
  viewClient: mockViewClient,
}));

describe('getSubAuctions()', () => {
  const inputAssetMetadata = new Metadata({
    display: 'input',
    base: 'input',
    denomUnits: [
      { denom: 'uinput', exponent: 0 },
      { denom: 'input', exponent: 6 },
    ],
    penumbraAssetId: { inner: new Uint8Array([1]) },
  });
  const outputAssetMetadata = new Metadata({
    display: 'output',
    base: 'uoutput',
    denomUnits: [
      { denom: 'moutput', exponent: 0 },
      { denom: 'output', exponent: 3 },
    ],
    penumbraAssetId: { inner: new Uint8Array([2]) },
  });

  const ARGS = {
    amount: '123',
    duration: '10min',
    maxOutput: '1000',
    minOutput: '1',
    assetIn: new BalancesResponse({
      balanceView: {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: { hi: 1234n, lo: 0n },
            metadata: inputAssetMetadata,
          },
        },
      },
    }),
    assetOut: outputAssetMetadata,
  } satisfies Parameters<typeof getSubAuctions>[0];

  it('uses a step count of 60', async () => {
    expect.hasAssertions();

    const subAuctions = await getSubAuctions(ARGS);

    subAuctions.forEach(auction => {
      expect(auction.description?.stepCount).toBe(60n);
    });
  });

  it('correctly divides the input across sub-auctions, using the display denom exponent', async () => {
    expect.assertions(4);

    const subAuctions = await getSubAuctions({ ...ARGS, duration: '10min', amount: '100' });

    subAuctions.forEach(subAuction => {
      expect(subAuction.description?.input?.amount).toEqual(
        new Amount({ hi: 0n, lo: 25_000_000n }),
      );
    });
  });

  it('rounds down to the nearest whole number input', async () => {
    expect.assertions(4);

    const subAuctions = await getSubAuctions({ ...ARGS, duration: '10min', amount: '2.666666' });

    subAuctions.forEach(subAuction => {
      expect(subAuction.description?.input?.amount).toEqual(new Amount({ hi: 0n, lo: 666_666n }));
    });
  });

  it('correctly divides the min/max outputs across sub-auctions, using the display denom exponent', async () => {
    expect.assertions(8);

    const subAuctions = await getSubAuctions({
      ...ARGS,
      duration: '10min',
      minOutput: '1',
      maxOutput: '10',
    });

    subAuctions.forEach(subAuction => {
      expect(subAuction.description?.minOutput).toEqual(new Amount({ hi: 0n, lo: 250n }));
      expect(subAuction.description?.maxOutput).toEqual(new Amount({ hi: 0n, lo: 2_500n }));
    });
  });

  it('rounds down to the nearest whole number output', async () => {
    expect.assertions(8);

    const subAuctions = await getSubAuctions({
      ...ARGS,
      duration: '10min',
      maxOutput: '10.666',
      minOutput: '2.666',
    });

    subAuctions.forEach(subAuction => {
      expect(subAuction.description?.minOutput).toEqual(new Amount({ hi: 0n, lo: 666n }));
      expect(subAuction.description?.maxOutput).toEqual(new Amount({ hi: 0n, lo: 2_666n }));
    });
  });

  it("doesn't choke when the user enters too many decimal places for the given asset type", async () => {
    expect.assertions(12);

    const subAuctions = await getSubAuctions({
      ...ARGS,
      duration: '10min',
      amount: '2.666666666666666666666666666666',
      maxOutput: '10.666666666666666666666666666666',
      minOutput: '2.666666666666666666666666666666',
    });

    subAuctions.forEach(subAuction => {
      expect(subAuction.description?.input?.amount).toEqual(new Amount({ hi: 0n, lo: 666_666n }));
      expect(subAuction.description?.minOutput).toEqual(new Amount({ hi: 0n, lo: 666n }));
      expect(subAuction.description?.maxOutput).toEqual(new Amount({ hi: 0n, lo: 2_666n }));
    });
  });
});
