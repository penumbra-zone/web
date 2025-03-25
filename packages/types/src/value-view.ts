import {
  ValueView,
  ValueViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { create, toJson } from '@bufbuild/protobuf';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { AmountSchema } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { formatAmount } from './amount.js';

// Uses exponent in metadata to display amount in terms of display denom
export const getFormattedAmtFromValueView = (v: ValueView, commas = false): string => {
  if (!v.valueView.value) {
    throw new Error(
      `Cannot derive formatted amount from value view: ${JSON.stringify(toJson(ValueViewSchema, v))}`,
    );
  }

  if (v.valueView.case === 'knownAssetId' && v.valueView.value.metadata) {
    const { amount = create(AmountSchema), metadata } = v.valueView.value;
    const exponent = getDisplayDenomExponent.optional(metadata);
    return formatAmount({ amount, exponent, commas });
  } else {
    const { amount = create(AmountSchema) } = v.valueView.value;
    return formatAmount({ amount, commas });
  }
};
