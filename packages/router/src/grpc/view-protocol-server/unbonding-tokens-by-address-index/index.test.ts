import { describe, it, vi } from 'vitest';

const mockBalances = vi.hoisted(() => vi.fn());

vi.mock('./balances', () => ({
  balances: mockBalances,
}));

describe('Unbonding Tokens by Address Index handler', () => {
  describe('when passed no filter', () => {
    it.todo('returns all unbonding tokens, along with their claimable status');
  });

  describe('when filtering only for claimable tokens', () => {
    it.todo('returns only claimable unbonding tokens');
  });

  describe('when filtering only for not-yet-claimable tokens', () => {
    it.todo('returns only not-yet-claimable unbonding tokens');
  });

  it.todo("excludes any tokens that aren't unbonding tokens");
});
