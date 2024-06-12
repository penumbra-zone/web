import { describe, expect, it } from 'vitest';
import { getOneWaySwapValues, isOneWaySwap } from './swap';
import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { NoteView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';

const asset1Metadata = new Metadata({
  symbol: 'ASSET1',
});

const asset2Metadata = new Metadata({
  symbol: 'ASSET2',
});

describe('isOneWaySwap()', () => {
  it('returns true when only delta 1 is zero', () => {
    const swapView = new SwapView({
      swapView: {
        case: 'visible',
        value: {
          swapPlaintext: {
            delta1I: { hi: 0n, lo: 0n },
            delta2I: { hi: 0n, lo: 2n },
          },
        },
      },
    });

    expect(isOneWaySwap(swapView)).toBe(true);
  });

  it('returns true when only delta 2 is zero', () => {
    const swapView = new SwapView({
      swapView: {
        case: 'visible',
        value: {
          swapPlaintext: {
            delta1I: { hi: 0n, lo: 2n },
            delta2I: { hi: 0n, lo: 0n },
          },
        },
      },
    });

    expect(isOneWaySwap(swapView)).toBe(true);
  });

  it('returns true when both deltas are zero', () => {
    const swapView = new SwapView({
      swapView: {
        case: 'visible',
        value: {
          swapPlaintext: {
            delta1I: { hi: 0n, lo: 0n },
            delta2I: { hi: 0n, lo: 0n },
          },
        },
      },
    });

    expect(isOneWaySwap(swapView)).toBe(true);
  });

  it('returns false when both deltas are nonzero', () => {
    const swapView = new SwapView({
      swapView: {
        case: 'visible',
        value: {
          swapPlaintext: {
            delta1I: { hi: 0n, lo: 1n },
            delta2I: { hi: 0n, lo: 2n },
          },
        },
      },
    });

    expect(isOneWaySwap(swapView)).toBe(false);
  });
});

describe('getOneWaySwapValues()', () => {
  describe('when passed a `SwapView` with no nonzero deltas', () => {
    const swapViewWithNoNonzeroInputs = new SwapView({
      swapView: {
        case: 'visible',
        value: {
          swapPlaintext: {
            delta1I: { hi: 0n, lo: 1n },
            delta2I: { hi: 0n, lo: 2n },
          },
        },
      },
    });

    it('throws', () => {
      expect(() => getOneWaySwapValues(swapViewWithNoNonzeroInputs)).toThrow(
        'Attempted to get one-way swap values from a two-way swap.',
      );
    });
  });

  describe('when passed a `SwapView` with exactly one nonzero delta', () => {
    describe('asset1 -> asset2 swap', () => {
      const output1 = new NoteView({
        value: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 0n },
            },
          },
        },
      });

      const output2 = new NoteView({
        value: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 5n },
            },
          },
        },
      });

      const swapViewWithOneNonzeroInput = new SwapView({
        swapView: {
          case: 'visible',
          value: {
            swapPlaintext: {
              delta1I: { hi: 0n, lo: 1n },
              delta2I: { hi: 0n, lo: 0n },
            },
            asset1Metadata,
            asset2Metadata,
            output1,
            output2,
          },
        },
      });

      it('returns the values in the correct fields', () => {
        expect(getOneWaySwapValues(swapViewWithOneNonzeroInput)).toEqual({
          input: new ValueView({
            valueView: {
              case: 'knownAssetId',
              value: {
                amount: { hi: 0n, lo: 1n },
                metadata: asset1Metadata,
              },
            },
          }),
          output: output2.value,
        });
      });
    });

    describe('asset2 -> asset1 swap', () => {
      const output1 = new NoteView({
        value: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 5n },
            },
          },
        },
      });

      const output2 = new NoteView({
        value: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 0n },
            },
          },
        },
      });

      const swapViewWithOneNonzeroInput = new SwapView({
        swapView: {
          case: 'visible',
          value: {
            swapPlaintext: {
              delta1I: { hi: 0n, lo: 0n },
              delta2I: { hi: 0n, lo: 1n },
            },
            asset1Metadata,
            asset2Metadata,
            output1,
            output2,
          },
        },
      });

      it('returns the values in the correct fields', () => {
        expect(getOneWaySwapValues(swapViewWithOneNonzeroInput)).toEqual({
          input: new ValueView({
            valueView: {
              case: 'knownAssetId',
              value: {
                amount: { hi: 0n, lo: 1n },
                metadata: asset2Metadata,
              },
            },
          }),
          output: output1.value,
        });
      });
    });

    describe('when both outputs are nonzero', () => {
      const output1 = new NoteView({
        value: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 2n },
            },
          },
        },
      });

      const output2 = new NoteView({
        value: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 5n },
            },
          },
        },
      });

      const swapViewWithTwoNonzeroOutputs = new SwapView({
        swapView: {
          case: 'visible',
          value: {
            swapPlaintext: {
              delta1I: { hi: 0n, lo: 10n },
              delta2I: { hi: 0n, lo: 0n },
            },
            asset1Metadata,
            asset2Metadata,
            output1,
            output2,
          },
        },
      });

      it('returns an unfilled amount', () => {
        expect(getOneWaySwapValues(swapViewWithTwoNonzeroOutputs)).toEqual({
          input: new ValueView({
            valueView: {
              case: 'knownAssetId',
              value: {
                amount: { hi: 0n, lo: 10n },
                metadata: asset1Metadata,
              },
            },
          }),
          output: output2.value,
          unfilled: output1.value,
        });
      });
    });
  });

  describe('when passed a `SwapView` with two zero-amount deltas', () => {
    const output1 = new NoteView({
      value: {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: { hi: 0n, lo: 0n },
          },
        },
      },
    });

    const output2 = new NoteView({
      value: {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: { hi: 0n, lo: 0n },
          },
        },
      },
    });

    const swapViewWithOneNonzeroInput = new SwapView({
      swapView: {
        case: 'visible',
        value: {
          swapPlaintext: {
            delta1I: { hi: 0n, lo: 0n },
            delta2I: { hi: 0n, lo: 0n },
          },
          asset1Metadata,
          asset2Metadata,
          output1,
          output2,
        },
      },
    });

    it('returns the values in the order asset1 -> asset2', () => {
      expect(getOneWaySwapValues(swapViewWithOneNonzeroInput)).toEqual({
        input: new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 0n },
              metadata: asset1Metadata,
            },
          },
        }),
        output: output2.value,
      });
    });
  });
});
