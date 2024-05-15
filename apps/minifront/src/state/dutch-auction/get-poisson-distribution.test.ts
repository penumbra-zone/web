import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPoissonDistribution } from './get-poisson-distribution';

describe('getPoissonDistribution()', () => {
  const originalMathRandom = Math.random;
  let mathRandomMock: Mock;

  beforeEach(() => {
    mathRandomMock = vi.fn();
    Math.random = mathRandomMock;
  });

  afterEach(() => {
    Math.random = originalMathRandom;
  });

  it('returns a poisson distribution', () => {
    mathRandomMock.mockReturnValueOnce(0).mockReturnValueOnce(1);
    expect(getPoissonDistribution(0.5, 2)).toBe(1);

    mathRandomMock
      .mockReturnValueOnce(0.15)
      .mockReturnValueOnce(0.25)
      .mockReturnValueOnce(0.35)
      .mockReturnValueOnce(0.123);
    expect(getPoissonDistribution(0.5, 3)).toBe(1);
  });
});
