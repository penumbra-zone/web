import { describe, expect, test } from 'vitest';
import { asOpaqueMemoView, asReceiverMemoView } from './memo-view';
import {
  MemoView,
  MemoView_Visible,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { asOpaqueAddressView } from './address-view';

describe('asOpaqueMemoView()', () => {
  describe('when passed a visible memo view', () => {
    const memoView = new MemoView({
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
        asOpaqueMemoView(memoView).equals(
          new MemoView({ memoView: { case: 'opaque', value: {} } }),
        ),
      ).toBe(true);
    });
  });

  describe('when passed an already-opaque memo view', () => {
    const memoView = new MemoView({
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
        asOpaqueMemoView(undefined).equals(
          new MemoView({ memoView: { case: 'opaque', value: {} } }),
        ),
      ).toBe(true);
    });
  });
});

describe('asReceiverMemoView()', () => {
  describe('when passed a visible memo view', () => {
    const memoView = new MemoView({
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
      const expected = memoView.clone();
      (expected.memoView.value as MemoView_Visible).plaintext!.returnAddress = asOpaqueAddressView(
        (expected.memoView.value as MemoView_Visible).plaintext!.returnAddress,
      )!;

      expect(asReceiverMemoView(memoView).equals(expected)).toBe(true);
    });
  });

  describe('when passed an opaque memo view', () => {
    const memoView = new MemoView({
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
        asReceiverMemoView(undefined).equals(
          new MemoView({ memoView: { case: 'visible', value: {} } }),
        ),
      ).toBe(true);
    });
  });
});
