import { BigNumber } from 'bignumber.js';
import { create, isMessage } from '@bufbuild/protobuf';
import { round } from '@penumbra-zone/types/round';
import { LoHi, joinLoHi, splitLoHi } from '@penumbra-zone/types/lo-hi';
import { AmountSchema } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import type { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import {
  Metadata,
  ValueView,
  ValueViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getAmount, getDisplayDenomExponentFromValueView } from '@penumbra-zone/getters/value-view';
import { removeTrailingZeros } from '@penumbra-zone/types/shortify';

/**
 * pnum (penumbra number)
 *
 * In Penumbra a number can be in the form of a base unit (bigint, LoHi, Amount, ValueView)
 * or a number with decimals for display purposes (string, number)
 *
 * This function handles all these cases automatically internally
 * - when input is a bigint, LoHi, Amount, or ValueView, it is assumed to be in base units
 * - when input is a string or number, it is multiplied by 10^exponent and converted to base units
 *
 * Likewise for all methods, the outputs are
 * - in base units for bigint, LoHi, Amount and ValueView
 * - in display form with decimals for string and number
 *
 * @param input
 * @param optionsOrExponent
 */
function pnum(
  input?: string | number | LoHi | bigint | Amount | ValueView | undefined,
  optionsOrExponent: { exponent?: number } | number = { exponent: 0 },
) {
  let value: BigNumber;
  let exponent =
    typeof optionsOrExponent === 'number' ? optionsOrExponent : (optionsOrExponent.exponent ?? 0);

  if (typeof input === 'string' || typeof input === 'number') {
    value = new BigNumber(input).shiftedBy(exponent);
  } else if (typeof input === 'bigint') {
    value = new BigNumber(input.toString());
  } else if (
    typeof input === 'object' &&
    'valueView' in input &&
    typeof input.valueView === 'object'
  ) {
    const amount = getAmount(input);
    value = new BigNumber(joinLoHi(amount.lo, amount.hi).toString());
    exponent =
      input.valueView.case === 'knownAssetId' ? getDisplayDenomExponentFromValueView(input) : 0;
  } else if (
    isMessage(input, AmountSchema) ||
    (typeof input === 'object' &&
      'lo' in input &&
      'hi' in input &&
      typeof input.lo === 'bigint' &&
      typeof input.hi === 'bigint')
  ) {
    value = new BigNumber(joinLoHi(input.lo, input.hi).toString());
  } else {
    value = new BigNumber(0);
  }

  return {
    toNumber(): number {
      const number = value.shiftedBy(-exponent).toNumber();
      if (!Number.isFinite(number)) {
        throw new Error('Number exceeds JavaScript numeric limits, convert to other type instead.');
      }
      return number;
    },

    toRoundedNumber(decimals = exponent): number {
      const number = value.shiftedBy(-exponent).toNumber();
      if (!Number.isFinite(number)) {
        throw new Error('Number exceeds JavaScript numeric limits, convert to other type instead.');
      }
      return Number(round({ value: number, decimals }));
    },

    toString(): string {
      return value.shiftedBy(-exponent).toString();
    },

    toRoundedString(decimals = exponent): string {
      return round({ value: value.shiftedBy(-exponent).toString(), decimals, trailingZeros: true });
    },

    toFormattedString(
      options: {
        commas?: boolean;
        decimals?: number;
        trailingZeros?: boolean;
      } = {},
    ): string {
      const defaultOptions = {
        commas: true,
        decimals: exponent,
        trailingZeros: true,
      };

      const { commas, decimals, trailingZeros } = {
        ...defaultOptions,
        ...options,
      };

      const number = value.shiftedBy(-exponent).toFormat(decimals, {
        decimalSeparator: '.',
        groupSeparator: commas ? ',' : '',
        groupSize: 3,
      });

      return trailingZeros ? number : removeTrailingZeros(number);
    },

    toBigInt(): bigint {
      return BigInt(value.toFixed(0));
    },

    toBigNumber(): BigNumber {
      return value.shiftedBy(-exponent);
    },

    toLoHi(): LoHi {
      return splitLoHi(BigInt(value.toFixed(0)));
    },

    toAmount(): Amount {
      return create(AmountSchema, splitLoHi(BigInt(value.toFixed(0))));
    },

    toValueView(metadata?: Metadata): ValueView {
      if (metadata) {
        return create(ValueViewSchema, {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: create(AmountSchema, splitLoHi(BigInt(value.toFixed(0)))),
              metadata,
            },
          },
        });
      }

      return create(ValueViewSchema, {
        valueView: {
          case: 'unknownAssetId',
          value: {
            amount: create(AmountSchema, splitLoHi(BigInt(value.toFixed(0)))),
          },
        },
      });
    },
  };
}

export { pnum };
