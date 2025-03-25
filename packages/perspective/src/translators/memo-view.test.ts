import { describe, expect, test } from 'vitest';
import { clone, create, equals } from '@bufbuild/protobuf';
import { asOpaqueMemoView, asReceiverMemoView } from './memo-view.js';
import {
  MemoViewSchema,
  MemoView_Visible,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { asOpaqueAddressView } from './address-view.js';

describe('asOpaqueMemoView()', () => {
  describe('when passed a visible memo view', () => {
    const memoView = create(MemoViewSchema, {
      memoView: {
        case: 'visible',
        value: {
          plaintext: {
            text: 'Memo text',
            returnAddress: {
              addressView: {
                case: 'decoded',
                value: {
                  address: {
                    inner: Uint8Array.from([0, 1, 2, 3]),
                  },
                  index: {
                    account: 0,
                  },
                  walletId: {
                    inner: Uint8Array.from([0, 1, 2, 3]),
                  },
                },
              },
            },
          },
        },
      },
    });

    test('returns an opaque, empty memo view', () => {
      expect(
        equals(
          MemoViewSchema,
          asOpaqueMemoView(memoView),
          create(MemoViewSchema, { memoView: { case: 'opaque', value: {} } }),
        ),
      ).toBe(true);
    });
  });

  describe('when passed an already-opaque memo view', () => {
    const memoView = create(MemoViewSchema, {
      memoView: {
        case: 'opaque',
        value: {
          ciphertext: {
            inner: Uint8Array.from([0, 1, 2, 3]),
          },
        },
      },
    });

    test('returns the memo view as-is', () => {
      expect(asOpaqueMemoView(memoView)).toBe(memoView);
    });
  });

  describe('when passed `undefined`', () => {
    test('returns an opaque, empty memo view', () => {
      expect(
        equals(
          MemoViewSchema,
          asOpaqueMemoView(undefined),
          create(MemoViewSchema, { memoView: { case: 'opaque', value: {} } }),
        ),
      ).toBe(true);
    });
  });
});

describe('asReceiverMemoView()', () => {
  describe('when passed a visible memo view', () => {
    const memoView = create(MemoViewSchema, {
      memoView: {
        case: 'visible',
        value: {
          plaintext: {
            text: 'Memo text',
            returnAddress: {
              addressView: {
                case: 'decoded',
                value: {
                  address: {
                    inner: Uint8Array.from([0, 1, 2, 3]),
                  },
                  index: {
                    account: 0,
                  },
                  walletId: {
                    inner: Uint8Array.from([0, 1, 2, 3]),
                  },
                },
              },
            },
          },
          ciphertext: {
            inner: Uint8Array.from([0, 1, 2, 3]),
          },
        },
      },
    });

    test('makes the address view opaque, but leaves the rest as-is', () => {
      const expected = clone(MemoViewSchema, memoView);
      (expected.memoView.value as MemoView_Visible).plaintext!.returnAddress = asOpaqueAddressView(
        (expected.memoView.value as MemoView_Visible).plaintext!.returnAddress,
      )!;

      expect(equals(MemoViewSchema, expected, asReceiverMemoView(memoView))).toBe(true);
    });
  });

  describe('when passed an opaque memo view', () => {
    const memoView = create(MemoViewSchema, {
      memoView: {
        case: 'opaque',
        value: {
          ciphertext: {
            inner: Uint8Array.from([0, 1, 2, 3]),
          },
        },
      },
    });

    test('returns the memo view as-is', () => {
      expect(asReceiverMemoView(memoView)).toBe(memoView);
    });
  });

  describe('when passed `undefined`', () => {
    test('returns a visible, empty memo view', () => {
      expect(
        equals(
          MemoViewSchema,
          asReceiverMemoView(undefined),
          create(MemoViewSchema, { memoView: { case: 'visible', value: {} } }),
        ),
      ).toBe(true);
    });
  });
});
