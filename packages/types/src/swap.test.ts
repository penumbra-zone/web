import { describe, expect, it } from 'vitest';
import { create } from '@bufbuild/protobuf';
import { getOneWaySwapValues, isOneWaySwap } from './swap.js';
import { SwapViewSchema } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import {
  MetadataSchema,
  ValueViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { NoteViewSchema } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';

const asset1Metadata = create(MetadataSchema, {
  symbol: 'ASSET1',
});

const asset2Metadata = create(MetadataSchema, {
  symbol: 'ASSET2',
});

describe('isOneWaySwap()', () => {
  it('returns true when only delta 1 is zero', () => {
    const swapView = create(SwapViewSchema, {
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
    const swapView = create(SwapViewSchema, {
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
    const swapView = create(SwapViewSchema, {
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
    const swapView = create(SwapViewSchema, {
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
    const swapViewWithNoNonzeroInputs = create(SwapViewSchema, {
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
      const output1 = create(NoteViewSchema, {
        value: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 0n },
            },
          },
        },
      });

      const output2 = create(NoteViewSchema, {
        value: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 5n },
            },
          },
        },
      });

      const swapViewWithOneNonzeroInput = create(SwapViewSchema, {
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
          input: create(ValueViewSchema, {
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
      const output1 = create(NoteViewSchema, {
        value: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 5n },
            },
          },
        },
      });

      const output2 = create(NoteViewSchema, {
        value: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 0n },
            },
          },
        },
      });

      const swapViewWithOneNonzeroInput = create(SwapViewSchema, {
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
          input: create(ValueViewSchema, {
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
      const output1 = create(NoteViewSchema, {
        value: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 2n },
            },
          },
        },
      });

      const output2 = create(NoteViewSchema, {
        value: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 5n },
            },
          },
        },
      });

      const swapViewWithTwoNonzeroOutputs = create(SwapViewSchema, {
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
          input: create(ValueViewSchema, {
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
    const output1 = create(NoteViewSchema, {
      value: {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: { hi: 0n, lo: 0n },
          },
        },
      },
    });

    const output2 = create(NoteViewSchema, {
      value: {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: { hi: 0n, lo: 0n },
          },
        },
      },
    });

    const swapViewWithOneNonzeroInput = create(SwapViewSchema, {
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
        input: create(ValueViewSchema, {
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
