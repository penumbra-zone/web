import { describe, expect, it } from 'vitest';
import { create, toJson } from '@bufbuild/protobuf';
import {
  MetadataSchema,
  ValueViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AmountSchema } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { getFormattedAmtFromValueView } from './value-view.js';

describe('getFormattedAmtFromValueView', () => {
  it('should format amount with known asset ID and metadata', () => {
    const valueView = create(ValueViewSchema, {
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: create(AmountSchema, { lo: 1000000n }),
          metadata: create(MetadataSchema, {
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
    const valueView = create(ValueViewSchema, {
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: create(AmountSchema, { lo: 1000000n }),
        },
      },
    });

    const formattedAmount = getFormattedAmtFromValueView(valueView);
    expect(formattedAmount).toBe('1000000');
  });

  it('should format amount with unknown asset ID', () => {
    const valueView = create(ValueViewSchema, {
      valueView: {
        case: 'unknownAssetId',
        value: {
          amount: create(AmountSchema, { lo: 1000000n }),
        },
      },
    });

    const formattedAmount = getFormattedAmtFromValueView(valueView);
    expect(formattedAmount).toBe('1000000');
  });

  it('should throw an error when value view is undefined', () => {
    const valueView = create(ValueViewSchema);

    expect(() => getFormattedAmtFromValueView(valueView)).toThrowError(
      `Cannot derive formatted amount from value view: ${JSON.stringify(toJson(ValueViewSchema, valueView))}`,
    );
  });

  it('should format amount with commas when specified', () => {
    const valueView = create(ValueViewSchema, {
      valueView: {
        case: 'unknownAssetId',
        value: {
          amount: create(AmountSchema, { lo: 1000000n }),
        },
      },
    });

    const formattedAmount = getFormattedAmtFromValueView(valueView, true);
    expect(formattedAmount).toBe('1,000,000');
  });
});
