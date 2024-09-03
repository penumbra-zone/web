import { describe, expect, it } from 'vitest';
import { filterMetadataOrBalancesResponseByText } from './filterMetadataOrBalancesResponseByText';
import { PENUMBRA_BALANCE, PENUMBRA_METADATA } from '../utils/bufs';

describe('filterMetadataOrBalancesResponseByText()', () => {
  describe('when the search text is empty', () => {
    it('returns `true`', () => {
      expect(filterMetadataOrBalancesResponseByText('')(PENUMBRA_METADATA)).toBe(true);
    });
  });

  describe('when the search text is just whitespace', () => {
    it('returns `true`', () => {
      expect(filterMetadataOrBalancesResponseByText(' ')(PENUMBRA_METADATA)).toBe(true);
    });
  });

  describe('when the value is a `Metadata`', () => {
    it('returns `true` when the metadata name contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('Pen')(PENUMBRA_METADATA)).toBe(true);
    });

    it('returns `true` when the metadata symbol contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('UM')(PENUMBRA_METADATA)).toBe(true);
    });

    it('returns `true` when the display contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('penum')(PENUMBRA_METADATA)).toBe(true);
    });

    it('returns `true` when the base contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('upenumbra')(PENUMBRA_METADATA)).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(filterMetadataOrBalancesResponseByText('pen')(PENUMBRA_METADATA)).toBe(true);
    });
  });

  describe('when the value is a `BalancesResponse`', () => {
    it('returns `true` when the metadata name contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('Pen')(PENUMBRA_BALANCE)).toBe(true);
    });

    it('returns `true` when the metadata symbol contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('UM')(PENUMBRA_BALANCE)).toBe(true);
    });

    it('returns `true` when the display contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('penumbra')(PENUMBRA_BALANCE)).toBe(true);
    });

    it('returns `true` when the base contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('upenumbra')(PENUMBRA_BALANCE)).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(filterMetadataOrBalancesResponseByText('pen')(PENUMBRA_BALANCE)).toBe(true);
    });
  });
});
