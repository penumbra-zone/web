import { describe, expect, it } from 'vitest';
import { filterMetadataOrBalancesResponseByText } from './filterMetadataOrBalancesResponseByText';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

const um = new Metadata({
  base: 'upenumbra',
  name: 'Penumbra',

  // Including some extra text in these values to make sure we don't get false
  // positives in the tests, since e.g. a symbol of `UM` is entirely contained
  // in the name `Penumbra`.
  symbol: 'UMSymbol',
  display: 'penumbraDisplay',
});

const umBalance = new BalancesResponse({
  balanceView: {
    valueView: {
      case: 'knownAssetId',
      value: {
        metadata: um,
      },
    },
  },
});

describe('filterMetadataOrBalancesResponseByText()', () => {
  describe('when the search text is empty', () => {
    it('returns `true`', () => {
      expect(filterMetadataOrBalancesResponseByText('')(um)).toBe(true);
    });
  });

  describe('when the search text is just whitespace', () => {
    it('returns `true`', () => {
      expect(filterMetadataOrBalancesResponseByText(' ')(um)).toBe(true);
    });
  });

  describe('when the value is a `Metadata`', () => {
    it('returns `true` when the metadata name contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('Pen')(um)).toBe(true);
    });

    it('returns `true` when the metadata symbol contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('UMSymbol')(um)).toBe(true);
    });

    it('returns `true` when the display contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('penumbraDisplay')(um)).toBe(true);
    });

    it('returns `true` when the base contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('upenumbra')(um)).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(filterMetadataOrBalancesResponseByText('pen')(um)).toBe(true);
    });
  });

  describe('when the value is a `BalancesResponse`', () => {
    it('returns `true` when the metadata name contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('Pen')(umBalance)).toBe(true);
    });

    it('returns `true` when the metadata symbol contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('UMSymbol')(umBalance)).toBe(true);
    });

    it('returns `true` when the display contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('penumbraDisplay')(umBalance)).toBe(true);
    });

    it('returns `true` when the base contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('upenumbra')(umBalance)).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(filterMetadataOrBalancesResponseByText('pen')(umBalance)).toBe(true);
    });
  });
});
