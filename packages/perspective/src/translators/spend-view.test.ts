import { asOpaqueSpendView } from './spend-view.js';
import { create, equals } from '@bufbuild/protobuf';
import { describe, expect, test } from 'vitest';
import { SpendViewSchema } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';

describe('asOpaqueSpendView', () => {
  describe('when passed `undefined`', () => {
    test('returns an empty, opaque spend view', () => {
      const expected = create(SpendViewSchema, {
        spendView: {
          case: 'opaque',
          value: {},
        },
      });

      expect(equals(SpendViewSchema, asOpaqueSpendView(undefined), expected)).toBe(true);
    });
  });

  describe('when passed an already-opaque spend view', () => {
    const spendView = create(SpendViewSchema, {
      spendView: {
        case: 'opaque',
        value: {
          spend: {
            body: {
              balanceCommitment: {
                inner: Uint8Array.from([0, 1, 2, 3]),
              },
            },
          },
        },
      },
    });

    test('returns the spend view as-is', () => {
      expect(asOpaqueSpendView(spendView)).toBe(spendView);
    });
  });

  describe('when passed a visible spend view', () => {
    const spendView = create(SpendViewSchema, {
      spendView: {
        case: 'visible',
        value: {
          note: {
            address: {
              addressView: {
                case: 'decoded',
                value: {
                  address: {
                    inner: Uint8Array.from([0, 1, 2, 3]),
                  },
                  index: {
                    account: 0,
                  },
                },
              },
            },
            value: {
              valueView: {
                case: 'unknownAssetId',
                value: {
                  amount: {
                    hi: 1n,
                    lo: 0n,
                  },
                  assetId: {
                    inner: Uint8Array.from([0, 1, 2, 3]),
                  },
                },
              },
            },
          },
          spend: {
            body: {
              balanceCommitment: {
                inner: Uint8Array.from([0, 1, 2, 3]),
              },
            },
          },
        },
      },
    });

    test('returns an opaque version of the spend view', () => {
      const result = asOpaqueSpendView(spendView);

      expect(result.spendView.case).toBe('opaque');
      expect(result.spendView.value?.spend).toBe(spendView.spendView.value?.spend);
      expect(result.spendView.value).not.toHaveProperty('note');
    });
  });
});
