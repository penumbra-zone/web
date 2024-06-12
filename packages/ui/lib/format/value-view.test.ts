import { describe, expect, it } from 'vitest';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { getFormattedAmtFromValueView } from './value-view';

describe('getFormattedAmtFromValueView', () => {
  it('should format amount with known asset ID and metadata', () => {
    const valueView = new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: new Amount({ lo: 1000000n }),
          metadata: new Metadata({
            display: 'test_usd',
            denomUnits: [{ denom: 'test_usd', exponent: 6 }],
          }),
        },
      },
    });

    const formattedAmount = getFormattedAmtFromValueView(valueView);
    expect(formattedAmount).toBe('1');
  });

  it('should format amount with known asset ID, but no metadata', () => {
    const valueView = new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: new Amount({ lo: 1000000n }),
        },
      },
    });

    const formattedAmount = getFormattedAmtFromValueView(valueView);
    expect(formattedAmount).toBe('1000000');
  });

  it('should format amount with unknown asset ID', () => {
    const valueView = new ValueView({
      valueView: {
        case: 'unknownAssetId',
        value: {
          amount: new Amount({ lo: 1000000n }),
        },
      },
    });

    const formattedAmount = getFormattedAmtFromValueView(valueView);
    expect(formattedAmount).toBe('1000000');
  });

  it('should throw an error when value view is undefined', () => {
    const valueView = new ValueView();

    expect(() => getFormattedAmtFromValueView(valueView)).toThrowError(
      `Cannot derive formatted amount from value view: ${JSON.stringify(valueView.toJson())}`,
    );
  });

  it('should format amount with commas when specified', () => {
    const valueView = new ValueView({
      valueView: {
        case: 'unknownAssetId',
        value: {
          amount: new Amount({ lo: 1000000n }),
        },
      },
    });

    const formattedAmount = getFormattedAmtFromValueView(valueView, true);
    expect(formattedAmount).toBe('1,000,000');
  });
});
