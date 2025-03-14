import { describe, expect, it } from 'vitest';
import { create } from '@bufbuild/protobuf';
import { assertSwapClaimAddressesBelongToCurrentUser } from './assert-swap-claim-addresses-belong-to-current-user.js';
import {
  ActionPlanSchema,
  TransactionPlanSchema,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { AddressSchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import type { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

const currentUserAddress1 = create(AddressSchema, {
  inner: new Uint8Array([1, 2, 3]),
});

const currentUserAddress2 = create(AddressSchema, {
  inner: new Uint8Array([4, 5, 6]),
});

const otherUserAddress = create(AddressSchema, {
  inner: new Uint8Array([7, 8, 9]),
});

const swapWithCurrentUserAddress1 = create(ActionPlanSchema, {
  action: {
    case: 'swap',
    value: {
      swapPlaintext: {
        claimAddress: currentUserAddress1,
      },
    },
  },
});

const swapWithCurrentUserAddress2 = create(ActionPlanSchema, {
  action: {
    case: 'swap',
    value: {
      swapPlaintext: {
        claimAddress: currentUserAddress2,
      },
    },
  },
});

const swapWithOtherUserAddress = create(ActionPlanSchema, {
  action: {
    case: 'swap',
    value: {
      swapPlaintext: {
        claimAddress: otherUserAddress,
      },
    },
  },
});

const swapWithUndefinedAddress = create(ActionPlanSchema, {
  action: {
    case: 'swap',
    value: {
      swapPlaintext: {},
    },
  },
});

const mockIsControlledAddress = (address?: Address) =>
  !!address && [currentUserAddress1, currentUserAddress2].includes(address);

describe('assertSwapClaimAddressesBelongToCurrentUser()', () => {
  describe('when the transaction plan has no swaps', () => {
    it('does not throw', () => {
      expect(() =>
        assertSwapClaimAddressesBelongToCurrentUser(
          create(TransactionPlanSchema),
          mockIsControlledAddress,
        ),
      ).not.toThrow();
    });
  });

  describe('when the transaction plan has swaps', () => {
    describe("when all of the swaps' `claimAddress`es belong to the current user", () => {
      it('does not throw', () => {
        const plan = create(TransactionPlanSchema, {
          actions: [swapWithCurrentUserAddress1, swapWithCurrentUserAddress2],
        });

        expect(() =>
          assertSwapClaimAddressesBelongToCurrentUser(plan, mockIsControlledAddress),
        ).not.toThrow();
      });
    });

    describe("when any of the swaps' `claimAddress`es do not belong to the current user", () => {
      it('throws a `ConnectError` with the `PermissionDenied` code', () => {
        const plan = create(TransactionPlanSchema, {
          actions: [swapWithCurrentUserAddress1, swapWithOtherUserAddress],
        });

        expect.assertions(2);

        try {
          assertSwapClaimAddressesBelongToCurrentUser(plan, mockIsControlledAddress);
        } catch (error) {
          expect(error).toBeInstanceOf(ConnectError);
          expect((error as ConnectError).code).toBe(Code.PermissionDenied);
        }
      });
    });

    describe("when any of the swaps' `claimAddress`es are empty", () => {
      it('throws a `ConnectError` with the `PermissionDenied` code', () => {
        const plan = create(TransactionPlanSchema, {
          actions: [swapWithUndefinedAddress],
        });

        expect.assertions(2);

        try {
          assertSwapClaimAddressesBelongToCurrentUser(plan, mockIsControlledAddress);
        } catch (error) {
          expect(error).toBeInstanceOf(ConnectError);
          expect((error as ConnectError).code).toBe(Code.PermissionDenied);
        }
      });
    });
  });
});
