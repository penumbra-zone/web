import { describe, expect, test } from 'vitest';
import { ValueViewComponent } from '.';
import { render } from '@testing-library/react';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';

describe('<ValueViewComponent />', () => {
  const penumbraMetadata = new Metadata({
    base: 'upenumbra',
    display: 'penumbra',
    symbol: 'UM',
    penumbraAssetId: {
      inner: base64ToUint8Array('KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA='),
    },
    images: [
      {
        png: 'https://raw.githubusercontent.com/penumbra-zone/web/main/apps/minifront/public/favicon.png',
      },
    ],
    denomUnits: [
      {
        denom: 'penumbra',
        exponent: 6,
      },
      {
        denom: 'mpenumbra',
        exponent: 3,
      },
      {
        denom: 'upenumbra',
        exponent: 0,
      },
    ],
  });

  describe('when rendering a known denomination', () => {
    const valueView = new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: {
            hi: 0n,
            lo: 123_456_789n,
          },
          metadata: penumbraMetadata,
        },
      },
    });

    test('renders the amount in the display denom unit', () => {
      const { container } = render(<ValueViewComponent view={valueView} />);

      expect(container).toHaveTextContent('123.456789UM');
    });
  });

  describe('when rendering an unknown denomination', () => {
    const valueView = new ValueView({
      valueView: {
        case: 'unknownAssetId',
        value: {
          amount: {
            hi: 0n,
            lo: 123_456_789n,
          },
          assetId: {
            inner: penumbraMetadata.penumbraAssetId!.inner,
          },
        },
      },
    });

    test('renders the amount in the base unit, along with an asset ID', () => {
      const { container } = render(<ValueViewComponent view={valueView} />);
      const assetIdAsString = bech32mAssetId(penumbraMetadata.penumbraAssetId!);

      expect(container).toHaveTextContent(`123,456,789${assetIdAsString}`);
    });
  });
});
