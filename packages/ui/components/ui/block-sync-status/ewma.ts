/**
 * Inspired from: https://github.com/rsocket/ewma/blob/master/index.js
 * However, the reason why we have our own code for this is because this library
 * was missing types and can only run in nodejs, not a browser environment.
 *
 * Ewma (Exponential Weighted Moving Average) is used to calculate a smoothed average of a series
 * of numbers, where more recent values have a greater weight than older values. This class is
 * particularly useful for smoothing out time-series data or calculating an average that needs to
 * adapt quickly to changes. The half-life parameter controls how quickly the weights decrease for
 * older values.
 */

interface EWMAProps {
  halfLifeMs?: number;
  initialValue?: number | undefined;
  clock?: Clock;
}

interface Clock {
  now: () => number;
}

export class EWMA {
  private readonly decay: number;
  private ewma: number;
  private lastUpdate: number;
  private clock: Clock;

  /**
   * Initializes a new instance of the Ewma class.
   *
   * @param halfLifeMs The half-life in milliseconds, indicating how quickly the influence of a value
   * decreases to half its original weight. This parameter directly impacts the speed of convergence
   * towards recent values, with lower values making the average more sensitive to recent changes.
   * @param initialValue The initial value of the EWMA, defaulted to 0 if not provided.
   * @param clock A function with a now() method. Defaults to Date. Helpful with testing.
   */

  constructor({ halfLifeMs = 10_000, initialValue = undefined, clock = Date }: EWMAProps = {}) {
    this.decay = halfLifeMs;
    this.ewma = initialValue ?? 0;
    this.clock = clock;
    this.lastUpdate = initialValue ? clock.now() : 0;
  }

  /**
   * Inserts a new value into the EWMA calculation, updating the average based on the elapsed time
   * since the last update and the new value's weight.
   */
  insert(x: number): void {
    const now = this.clock.now();
    const elapsed = now - this.lastUpdate;
    this.lastUpdate = now;

    // This seemingly magic equation is derived from the fact that we are
    // defining a half life for each value. A half life is the amount of time
    // that it takes for a value V to decay to .5V or V/2. Elapsed is the time
    // delta between this value being reported and the previous value being
    // reported. Given the half life, and the amount of time since the last
    // reported value, this equation determines how much the new value should
    // be represented in the ewma.
    // For a detailed proof read:
    // A Framework for the Analysis of Unevenly Spaced Time Series Data
    // Eckner, 2014
    const weight = Math.pow(2, -elapsed / this.decay);
    this.ewma = weight * this.ewma + (1 - weight) * x;
  }

  /**
   * Resets the EWMA to a specified new value, effectively restarting the calculation as if this
   * new value was the first and only value provided.
   */
  reset(x: number): void {
    this.lastUpdate = this.clock.now();
    this.ewma = x;
  }

  /**
   * Returns the current value of the EWMA.
   */
  value(): number {
    return this.ewma;
  }
}
