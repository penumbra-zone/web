import { ActionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { asPublicActionView, asReceiverActionView } from './action-view';
import { describe, expect, test, vi } from 'vitest';

describe('asPublicActionView()', () => {
  describe('when passed `undefined`', () => {
    test('returns an empty action view', () => {
      expect(asPublicActionView(undefined).equals(new ActionView())).toBe(true);
    });
  });

  describe('when passed an action view with an `undefined` case', () => {
    test('returns an empty action view', () => {
      expect(
        asPublicActionView(new ActionView({ actionView: { case: undefined } })).equals(
          new ActionView(),
        ),
      ).toBe(true);
    });
  });

  describe('when passed a spend action view', () => {
    const actionView = new ActionView({
      actionView: {
        case: 'spend',
        value: {
          spendView: {
            case: 'visible',
            value: {
              note: {
                address: {
                  addressView: {
                    case: 'visible',
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
                    case: 'unknownDenom',
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
        },
      },
    });

    test('returns an action view with an opaque spend view', () => {
      const expected = new ActionView({
        actionView: {
          case: 'spend',
          value: {
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
          },
        },
      });

      expect(asPublicActionView(actionView).equals(expected)).toBe(true);
    });
  });

  describe('when passed an output action view', () => {
    const actionView = new ActionView({
      actionView: {
        case: 'output',
        value: {
          outputView: {
            case: 'visible',
            value: {
              note: {
                address: {
                  addressView: {
                    case: 'visible',
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
                    case: 'unknownDenom',
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
        },
      },
    });

    test('returns an action view with an opaque output view', () => {
      const expected = new ActionView({
        actionView: {
          case: 'output',
          value: {
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
          },
        },
      });

      expect(asPublicActionView(actionView).equals(expected)).toBe(true);
    });
  });
});

describe('asReceiverActionView()', () => {
  describe('when passed `undefined`', () => {
    test('returns an empty action view', async () => {
      const result = await asReceiverActionView(vi.fn())(undefined);

      expect(result.equals(new ActionView())).toBe(true);
    });
  });

  describe('when passed an action view with an `undefined` case', () => {
    test('returns an empty action view', async () => {
      const result = await asReceiverActionView(vi.fn())(
        new ActionView({ actionView: { case: undefined } }),
      );

      expect(result.equals(new ActionView())).toBe(true);
    });
  });

  describe('when passed a spend action view', () => {
    const actionView = new ActionView({
      actionView: {
        case: 'spend',
        value: {
          spendView: {
            case: 'visible',
            value: {
              note: {
                address: {
                  addressView: {
                    case: 'visible',
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
                    case: 'unknownDenom',
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
        },
      },
    });

    test('returns an action view with an opaque spend view', async () => {
      const expected = new ActionView({
        actionView: {
          case: 'spend',
          value: {
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
          },
        },
      });

      const result = await asReceiverActionView(vi.fn())(actionView);

      expect(result.equals(expected)).toBe(true);
    });
  });

  describe('when passed an output action view', () => {
    const actionView = new ActionView({
      actionView: {
        case: 'output',
        value: {
          outputView: {
            case: 'visible',
            value: {
              note: {
                address: {
                  addressView: {
                    case: 'visible',
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
                    case: 'unknownDenom',
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
        },
      },
    });

    test('returns an action view with a receiver output view', async () => {
      const isControlledAddress = () => Promise.resolve(false);
      const result = await asReceiverActionView(isControlledAddress)(actionView);

      expect(result.equals(actionView)).toBe(true);
    });
  });
});
