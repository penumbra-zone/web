import { AuthorizationData } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { EffectHash } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { SpendAuthSignature } from '@penumbra-zone/protobuf/penumbra/crypto/decaf377_rdsa/v1/decaf377_rdsa_pb';
import { describe, expect, it } from 'vitest';
import { assertValidAuthorizationData } from './validate-response.js';
import { actionCountsInit } from './action-counts.js';

describe('assertValidAuthorizationData', () => {
  const mockSignature = new SpendAuthSignature({ inner: new Uint8Array(64).fill(1) });
  const mockEffectHash = new EffectHash({ inner: new Uint8Array(64).fill(1) });

  describe('effect hash validation', () => {
    it.each([undefined, 0, 64])('rejects effect hash with %s zeroes', innerSize => {
      const effectHash =
        innerSize != null ? new EffectHash({ inner: new Uint8Array(innerSize) }) : undefined;
      expect(() =>
        assertValidAuthorizationData(actionCountsInit, new AuthorizationData({ effectHash })),
      ).toThrow('Zero effect');
    });

    it('rejects effect hash with invalid size', () => {
      expect(() =>
        assertValidAuthorizationData(
          actionCountsInit,
          new AuthorizationData({ effectHash: { inner: mockEffectHash.inner.slice(1) } }),
        ),
      ).toThrow('Invalid effect hash');
    });

    it('accepts valid effect hash', () => {
      // We still need minimal valid auth data to pass other checks
      const authData = new AuthorizationData({
        effectHash: mockEffectHash,
      });

      // This validation should pass the effect hash check, but might fail others
      // We're just making sure the effect hash validation succeeds
      try {
        assertValidAuthorizationData(actionCountsInit, authData);
      } catch (error) {
        // Make sure any error is not related to the effect hash
        expect((error as Error).message).not.toContain('effect');
      }
    });
  });

  describe('spend authorization validations', () => {
    const authsAndActions = [
      { auths: 'spendAuths', action: 'spend' },
      { auths: 'delegatorVoteAuths', action: 'delegatorVote' },
      { auths: 'lqtVoteAuths', action: 'actionLiquidityTournamentVote' },
    ];

    it.each(authsAndActions)(
      'rejects when $auths count does not match $action count',
      ({ auths, action }) => {
        const twoActions = { ...actionCountsInit, [action]: 2 };

        const oneAuth = new AuthorizationData({
          effectHash: mockEffectHash,
          [auths]: [mockSignature],
        });

        expect(() => assertValidAuthorizationData(twoActions, oneAuth)).toThrow(
          `Missing ${action} authorization`,
        );
      },
    );

    it.each(authsAndActions)(
      'rejects when there are more $auths than $action',
      ({ auths, action }) => {
        const oneAction = { ...actionCountsInit, [action]: 1 };

        const twoAuths = new AuthorizationData({
          effectHash: mockEffectHash,
          [auths]: [mockSignature, mockSignature],
        });

        expect(() => assertValidAuthorizationData(oneAction, twoAuths)).toThrow(
          `Unexpected ${action} authorization`,
        );
      },
    );

    it.each(authsAndActions)('rejects when any $auth has invalid size', ({ auths, action }) => {
      const twoActions = { ...actionCountsInit, [action]: 2 };

      const oneInvalidSizeSig = new AuthorizationData({
        effectHash: mockEffectHash,
        [auths]: [mockSignature, { inner: mockSignature.inner.slice(1) }],
      });

      expect(() => assertValidAuthorizationData(twoActions, oneInvalidSizeSig)).toThrow(
        `Invalid ${action} authorization`,
      );
    });
  });

  it('accepts valid authorization data with matching action counts', () => {
    const mixedActions = {
      ...actionCountsInit,
      spend: 2,
      delegatorVote: 1,
      actionLiquidityTournamentVote: 1,
    };

    const authData = new AuthorizationData({
      effectHash: mockEffectHash,
      spendAuths: [mockSignature, mockSignature],
      delegatorVoteAuths: [mockSignature],
      lqtVoteAuths: [mockSignature],
    });

    expect(() => assertValidAuthorizationData(mixedActions, authData)).not.toThrow();
    // Should return the input data
    expect(assertValidAuthorizationData(mixedActions, authData)).toBe(authData);
  });
});
