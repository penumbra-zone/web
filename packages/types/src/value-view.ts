import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { formatAmount } from './amount';

// Uses exponent in metadata to display amount in terms of display denom
export const getFormattedAmtFromValueView = (v: ValueView, commas = false): string => {
  if (!v.valueView.value) {
    throw new Error(
      `Cannot derive formatted amount from value view: ${JSON.stringify(v.toJson())}`,
    );
  }

  if (v.valueView.case === 'knownAssetId' && v.valueView.value.metadata) {
    const { amount = new Amount(), metadata } = v.valueView.value;
    const exponent = getDisplayDenomExponent.optional()(metadata);
    return formatAmount({ amount, exponent, commas });
  } else {
    const { amount = new Amount() } = v.valueView.value;
    return formatAmount({ amount, commas });
  }
};
