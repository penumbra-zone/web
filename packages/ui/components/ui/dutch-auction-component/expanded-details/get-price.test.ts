import { describe, expect, it } from 'vitest';
import { getPrice } from './get-price';
import { DutchAuctionDescription } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

describe('getPrice()', () => {
  it('returns `undefined` if `fullSyncHeight` is `undefined`', () => {
    expect(getPrice(new DutchAuctionDescription(), new Metadata())).toBeUndefined();
  });

  it('returns the correct price at various sync heights', () => {
    const metadata = new Metadata({
      display: 'penumbra',
      base: 'upenumbra',
      denomUnits: [
        { denom: 'penumbra', exponent: 6 },
        { denom: 'upenumbra', exponent: 0 },
      ],
    });
    const auction = new DutchAuctionDescription({
      minOutput: {
        hi: 0n,
        lo: 1n,
      },
      maxOutput: {
        hi: 0n,
        lo: 10n,
      },
      stepCount: 10n,
      startHeight: 1n,
      endHeight: 10n,
      input: {
        amount: { hi: 0n, lo: 10n },
      },
    });

    // At the first step, we're selling 10 of the input for 10 of the output
    // (i.e., the `maxOutput`). Thus, there's a 1:1 ratio between the input and
    // output. We then scale up the price by the _input's_ display denom
    // exponent, to show what one input token is worth in terms of the output
    // token.
    expect(getPrice(auction, metadata, 1n)).toEqual(new Amount({ hi: 0n, lo: 1_000_000n }));

    // At the last step, we're selling 10 of the input for 1 of the output
    // (i.e., the `minOutput`). Thus, there's a 10:1 ratio between the input and
    // output. We then scale up the price by the _input's_ display denom
    // exponent, to show what one input token is worth in terms of the output
    // token.
    expect(getPrice(auction, metadata, 10n)).toEqual(new Amount({ hi: 0n, lo: 100_000n }));

    // Let's sanity check all the intermediate prices as well.
    expect(getPrice(auction, metadata, 2n)).toEqual(new Amount({ hi: 0n, lo: 900_000n }));
    expect(getPrice(auction, metadata, 3n)).toEqual(new Amount({ hi: 0n, lo: 800_000n }));
    expect(getPrice(auction, metadata, 4n)).toEqual(new Amount({ hi: 0n, lo: 700_000n }));
    expect(getPrice(auction, metadata, 5n)).toEqual(new Amount({ hi: 0n, lo: 600_000n }));
    expect(getPrice(auction, metadata, 6n)).toEqual(new Amount({ hi: 0n, lo: 500_000n }));
    expect(getPrice(auction, metadata, 7n)).toEqual(new Amount({ hi: 0n, lo: 400_000n }));
    expect(getPrice(auction, metadata, 8n)).toEqual(new Amount({ hi: 0n, lo: 300_000n }));
    expect(getPrice(auction, metadata, 9n)).toEqual(new Amount({ hi: 0n, lo: 200_000n }));
  });

  it("rounds to the nearest whole number if it can't be divided evenly", () => {
    const metadata = new Metadata({
      display: 'penumbra',
      base: 'upenumbra',
      denomUnits: [
        { denom: 'penumbra', exponent: 6 },
        { denom: 'upenumbra', exponent: 0 },
      ],
    });
    const auction = new DutchAuctionDescription({
      minOutput: {
        hi: 0n,
        lo: 0n,
      },
      maxOutput: {
        hi: 0n,
        lo: 10n,
      },
      stepCount: 4n,
      startHeight: 1n,
      endHeight: 4n,
      input: {
        amount: { hi: 0n, lo: 10n },
      },
    });

    expect(getPrice(auction, metadata, 2n)).toEqual(new Amount({ hi: 0n, lo: 666_667n }));
  });
});
