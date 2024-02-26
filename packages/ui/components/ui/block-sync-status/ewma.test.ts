import { describe, expect, it, vi } from 'vitest';
import { EWMA } from './ewma';

describe('EWMA', () => {
  describe('Constructor Tests', () => {
    it('initializes with default parameters correctly', () => {
      const ewma = new EWMA();
      expect(ewma.value()).toBe(0);
    });

    it('initializes with custom parameters correctly', () => {
      const halfLifeMs = 20000;
      const initialValue = 10;
      const ewma = new EWMA({ halfLifeMs, initialValue });
      expect(ewma.value()).toBe(initialValue);
    });
  });

  // Copied from original test suite: https://github.com/rsocket/ewma/blob/master/test/index.js
  describe('half life', () => {
    it('work properly', () => {
      let NOW = 10000000;
      const clock = {
        now: function () {
          return NOW;
        },
      };
      let e = new EWMA({ halfLifeMs: 1, initialValue: 10, clock });
      let shouldBe = 10;
      expect(e.value()).toBe(shouldBe);
      NOW++;

      for (let i = 1; i < 100; i++, NOW++) {
        shouldBe = shouldBe * 0.5 + i * 0.5;
        e.insert(i);
        expect(e.value()).toBe(shouldBe);
      }

      e.reset(0);
      shouldBe = 0;
      expect(e.value()).toBe(shouldBe);
      NOW += 1;

      for (let i = 1; i < 100; i++, NOW += 1) {
        shouldBe = shouldBe * 0.5 + i * 0.5;
        e.insert(i);
        expect(e.value()).toBe(shouldBe);
      }

      e = new EWMA({ halfLifeMs: 2, clock });
      shouldBe = 1;
      e.insert(1);
      expect(e.value()).toBe(shouldBe);
      NOW += 2;

      for (let i = 2; i < 100; i++, NOW += 2) {
        shouldBe = shouldBe * 0.5 + i * 0.5;
        e.insert(i);
        expect(e.value()).toBe(shouldBe);
      }
    });
  });

  describe('Decay Calculation', () => {
    it('affects EWMA value correctly over time', () => {
      const clock = { now: vi.fn(() => 1000) }; // Mock time starts at 1000
      const ewma = new EWMA({ halfLifeMs: 5000, initialValue: 50, clock });

      clock.now.mockReturnValue(2000); // Advance time by 1000ms
      ewma.insert(100); // Insert a higher value to see decay effect
      expect(ewma.value()).toBeLessThan(75); // Expect some decay towards the new value

      clock.now.mockReturnValue(7000); // Advance time significantly to test decay
      expect(ewma.value()).toBeLessThan(100); // Ensure value continues to decay towards most recent insert
    });
  });

  describe('Custom Clock Functionality', () => {
    it('uses custom clock correctly', () => {
      let mockTime = 1000;
      const clock = { now: () => mockTime };
      const ewma = new EWMA({ halfLifeMs: 10000, clock });
      ewma.insert(10);
      mockTime += 5000; // Simulate passing of time
      ewma.insert(20);
      expect(ewma.value()).toBeCloseTo(6.33, 2);
    });
  });

  describe('Reset Functionality', () => {
    it('correctly restarts calculation with various values', () => {
      const ewma = new EWMA();
      ewma.reset(100);
      expect(ewma.value()).toBe(100);
      ewma.reset(-50);
      expect(ewma.value()).toBe(-50);
    });
  });
});
