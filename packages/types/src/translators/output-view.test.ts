import { describe, expect, test, vi } from 'vitest';
import { asOpaqueOutputView, asReceiverOutputView } from './output-view';
import { OutputView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';

describe('asOpaqueOutputView()', () => {
  describe('when passed `undefined`', () => {
    test('returns a blank output view', () => {
      expect(asOpaqueOutputView(undefined).equals(new OutputView())).toBe(true);
    });
  });

  describe('when passed an already-opaque output view', () => {
    const outputView = new OutputView({
      outputView: {
        case: 'opaque',
        value: {
          output: {
            body: {
              balanceCommitment: {
                inner: Uint8Array.from([0, 1, 2, 3]),
              },
            },
          },
        },
      },
    });

    test('returns the output view as-is', () => {
      expect(asOpaqueOutputView(outputView)).toBe(outputView);
    });
  });

  describe('when passed a visible output view', () => {
    const outputView = new OutputView({
      outputView: {
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
          output: {
            body: {
              balanceCommitment: {
                inner: Uint8Array.from([0, 1, 2, 3]),
              },
            },
          },
        },
      },
    });

    test('returns an opaque version of the output view', () => {
      const result = asOpaqueOutputView(outputView);

      expect(result.outputView.case).toBe('opaque');
      expect(result.outputView.value?.output).toBe(outputView.outputView.value?.output);
      expect(result.outputView.value).not.toHaveProperty('note');
    });
  });
});

describe('asReceiverOutputView()', () => {
  describe('when passed `undefined`', () => {
    test('returns a blank output view', async () => {
      const isControlledAddress = vi.fn();
      const result = await asReceiverOutputView(undefined, { isControlledAddress });

      expect(result.equals(new OutputView())).toBe(true);
    });
  });

  describe('when passed an already-opaque output view', () => {
    const outputView = new OutputView({
      outputView: {
        case: 'opaque',
        value: {
          output: {
            body: {
              balanceCommitment: {
                inner: Uint8Array.from([0, 1, 2, 3]),
              },
            },
          },
        },
      },
    });

    test('returns the output view as-is', async () => {
      const isControlledAddress = vi.fn();
      await expect(asReceiverOutputView(outputView, { isControlledAddress })).resolves.toBe(
        outputView,
      );
    });
  });

  describe('when passed a visible output view', () => {
    const outputView = new OutputView({
      outputView: {
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
          output: {
            body: {
              balanceCommitment: {
                inner: Uint8Array.from([0, 1, 2, 3]),
              },
            },
          },
        },
      },
    });

    describe('when the address belongs to the current user', () => {
      // If calling `isControlledAddress` resolves to `true`, the address
      // belongs to the current user.
      const isControlledAddress = () => Promise.resolve(true);

      test('returns an opaque version of the output view', async () => {
        const result = await asReceiverOutputView(outputView, { isControlledAddress });

        expect(result.outputView.case).toBe('opaque');
        expect(result.outputView.value?.output).toBe(outputView.outputView.value?.output);
        expect(result.outputView.value).not.toHaveProperty('note');
      });
    });

    describe('when the address does not belong to the current user', () => {
      // If calling `isControlledAddress` resolves to `true`, the address
      // belongs to the current user.
      const isControlledAddress = () => Promise.resolve(false);

      test('returns the output view as-is', async () => {
        const result = await asReceiverOutputView(outputView, { isControlledAddress });

        expect(result).toBe(outputView);
      });
    });
  });
});
