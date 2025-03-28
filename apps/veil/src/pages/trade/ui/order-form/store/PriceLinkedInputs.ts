import { parseNumber } from '@/shared/utils/num';
import { makeAutoObservable } from 'mobx';

type LastEdited = 'A' | 'B';

/** Compute one input from the other, given the price.
 *
 * @returns the resulting other input, or `undefined` if the input should not change.
 */
const computeBFromA = (price: number, a: string): string | undefined => {
  const aNum = parseNumber(a);
  return aNum !== undefined ? (price * aNum).toString() : undefined;
};

/** A sub-store for managing a pair of inputs linked by a common price.
 *
 * This is useful for market and limit orders, where users can specify the amount
 * they want to buy or sell, with the other amount automatically updating based on the price.
 *
 * The inputs are always available as strings, and are intended to be used as the
 * value for an `<input>`.
 *
 * The price, however, is a number, and will update the inputs when it changes.
 * It does so by preserving the last edited input, and modifying the other one.
 * The intended use case here is that the user specifies that they want to buy / sell
 * a certain amount, and that this intent does not change if the market price changes,
 * or if they adjust the limit price.
 */
export class PriceLinkedInputs {
  private _inputA = '';
  private _inputB = '';
  private _lastEdited: LastEdited = 'A';
  private _price = 1;

  constructor() {
    makeAutoObservable(this);
  }

  private computeBFromA() {
    this._inputB = computeBFromA(this._price, this._inputA) ?? this._inputB;
  }

  private computeAFromB() {
    this._inputA = computeBFromA(1 / this._price, this._inputB) ?? this._inputA;
  }

  get inputA(): string {
    return this._inputA;
  }

  set inputA(x: string) {
    this._lastEdited = 'A';
    this._inputA = x;
    this.computeBFromA();
  }

  get inputB(): string {
    return this._inputB;
  }

  set inputB(x: string) {
    this._lastEdited = 'B';
    this._inputB = x;
    this.computeAFromB();
  }

  set price(x: number) {
    this._price = x;
    if (this._lastEdited === 'A') {
      this.computeBFromA();
    } else {
      this.computeAFromB();
    }
  }
}
