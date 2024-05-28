import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { fromBaseUnit, joinLoHi, splitLoHi, toBaseUnit } from './lo-hi';
import { BigNumber } from 'bignumber.js';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getAmount, getDisplayDenomExponentFromValueView } from '@penumbra-zone/getters/value-view';

export const joinLoHiAmount = (amount: Amount): bigint => {
  return joinLoHi(amount.lo, amount.hi);
};

export const fromBaseUnitAmount = (amount: Amount, exponent = 0): BigNumber => {
  return fromBaseUnit(amount.lo, amount.hi, exponent);
};

export const isZero = (amount: Amount): boolean => {
  return joinLoHiAmount(amount) === 0n;
};

export const fromValueView = (valueView: ValueView): BigNumber => {
  return fromBaseUnitAmount(
    getAmount(valueView),
    valueView.valueView.case === 'knownAssetId'
      ? getDisplayDenomExponentFromValueView(valueView)
      : 0,
  );
};

export const fromString = (amount: string, exponent = 0): Amount =>
  new Amount(
    toBaseUnit(BigNumber(amount).decimalPlaces(exponent, BigNumber.ROUND_FLOOR), exponent),
  );

export const addAmounts = (a: Amount, b: Amount): Amount => {
  const joined = joinLoHiAmount(a) + joinLoHiAmount(b);
  const { lo, hi } = splitLoHi(joined);
  return new Amount({ lo, hi });
};

export const subtractAmounts = (minuend: Amount, subtrahend: Amount): Amount => {
  const joinedMinuend = joinLoHiAmount(minuend);
  const joinedSubtrahend = joinLoHiAmount(subtrahend);

  if (joinedSubtrahend > joinedMinuend) throw new Error('Amount cannot be negative');

  const joined = joinedMinuend - joinedSubtrahend;
  const { lo, hi } = splitLoHi(joined);
  return new Amount({ lo, hi });
};

export const multiplyAmountByNumber = (amount: Amount, multiplier: number): Amount => {
  const amountAsBigNumber = new BigNumber(joinLoHiAmount(amount).toString());
  const result = amountAsBigNumber.multipliedBy(multiplier).decimalPlaces(0).toString(10);
  const loHi = splitLoHi(BigInt(result));

  return new Amount(loHi);
};

export const divideAmounts = (dividend: Amount, divisor: Amount): BigNumber => {
  if (isZero(divisor)) throw new Error('Division by zero');

  const joinedDividend = new BigNumber(joinLoHiAmount(dividend).toString());
  const joinedDivisor = new BigNumber(joinLoHiAmount(divisor).toString());

  return joinedDividend.dividedBy(joinedDivisor);
};

interface FormatOptions {
  precision: number;
}

export const formatNumber = (number: number, options: FormatOptions): string => {
  const { precision } = options;

  // Use toFixed to set the precision and then remove unnecessary trailing zeros
  return precision === 0
    ? number.toFixed(precision)
    : parseFloat(number.toFixed(precision)).toString();
};

export const formatAmount = (amount: Amount, exponent = 0) =>
  fromBaseUnitAmount(amount, exponent)
    .toFormat(6)
    .replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');

/**
 * Exchange rates in core are expressed as whole numbers on the order of 10 to
 * the power of 8, so they need to be divided by 10e8 to turn into a decimal.
 *
 * @see https://github.com/penumbra-zone/penumbra/blob/839f978/crates/bin/pcli/src/command/view/staked.rs#L90-L93
 */
const EXCHANGE_RATE_DENOMINATOR = 1e8;

/**
 * Given an amount expressing an exchange rate, returns a decimal representation of
 * that exchange rate. This makes it easy to multiply by exchange rates.
 *
 * For example, an exchange rate of 150_000_000 is 1.5. Thus,
 * `toBasisPointsAsDecimal(amount)`, where `amount` is an `Amount` totaling
 * `150_000_000n`, will return `1.5`.
 */
export const toDecimalExchangeRate = (
  /**
   * An amount expressing basis points -- i.e., one hundredth of one percent.
   *
   * @see https://en.wikipedia.org/wiki/Basis_point
   */
  amount: Amount,
) => {
  const joinedDividend = new BigNumber(joinLoHiAmount(amount).toString());

  return joinedDividend.dividedBy(EXCHANGE_RATE_DENOMINATOR).toNumber();
};
