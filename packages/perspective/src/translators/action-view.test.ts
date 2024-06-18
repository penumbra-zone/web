import { ActionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { asPublicActionView, asReceiverActionView } from './action-view';
import { describe, expect, test, vi } from 'vitest';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));

describe('asPublicActionView()', () => {
  describe('when passed `undefined`', () => {
    test('returns an empty action view', () => {
      expect(asPublicActionView(undefined)).toBeUndefined();
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
                    case: 'decoded',
                    value: {
                      address: {
                        inner: u8(80),
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
                        inner: u8(32),
                      },
                    },
                  },
                },
              },
              spend: {
                body: {
                  balanceCommitment: {
                    inner: new Uint8Array(), // no idea
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
                      inner: new Uint8Array(), // no idea
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
                    case: 'decoded',
                    value: {
                      address: {
                        inner: u8(80),
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
                        inner: u8(32),
                      },
                    },
                  },
                },
              },
              output: {
                body: {
                  balanceCommitment: {
                    inner: new Uint8Array(), // no idea
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
                      inner: new Uint8Array(), // no ide
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

  describe('when passed a delegate action view', () => {
    const actionView = new ActionView({
      actionView: {
        case: 'delegate',
        value: {
          epochIndex: 0n,
          delegationAmount: { hi: 0n, lo: 1n },
        },
      },
    });

    test('returns the action view as-is', () => {
      expect(asPublicActionView(actionView).equals(actionView)).toBe(true);
    });
  });

  describe('when passed an undelegate action view', () => {
    const actionView = new ActionView({
      actionView: {
        case: 'undelegate',
        value: {
          startEpochIndex: 0n,
          delegationAmount: { hi: 0n, lo: 1n },
        },
      },
    });

    test('returns the action view as-is', () => {
      expect(asPublicActionView(actionView).equals(actionView)).toBe(true);
    });
  });
});

describe('asReceiverActionView()', () => {
  describe('when passed `undefined`', () => {
    test('returns an empty action view', async () => {
      const isControlledAddress = vi.fn();
      const result = await asReceiverActionView(undefined, { isControlledAddress });

      expect(result).toBeUndefined();
    });
  });

  describe('when passed an action view with an `undefined` case', () => {
    test('returns an empty action view', async () => {
      const isControlledAddress = vi.fn();
      const result = await asReceiverActionView(
        new ActionView({ actionView: { case: undefined } }),
        { isControlledAddress },
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
                    case: 'decoded',
                    value: {
                      address: {
                        inner: u8(80),
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
                        inner: u8(32),
                      },
                    },
                  },
                },
              },
              spend: {
                body: {
                  balanceCommitment: {
                    inner: new Uint8Array(), // no idea
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
                      inner: new Uint8Array(), // no idea
                    },
                  },
                },
              },
            },
          },
        },
      });

      const isControlledAddress = vi.fn();
      const result = await asReceiverActionView(actionView, { isControlledAddress });

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
                    case: 'decoded',
                    value: {
                      address: {
                        inner: u8(80),
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
                        inner: u8(32),
                      },
                    },
                  },
                },
              },
              output: {
                body: {
                  balanceCommitment: {
                    inner: new Uint8Array(),
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
      const result = await asReceiverActionView(actionView, { isControlledAddress });

      expect(result.equals(actionView)).toBe(true);
    });
  });

  describe('when passed a delegate action view', () => {
    const actionView = new ActionView({
      actionView: {
        case: 'delegate',
        value: {
          epochIndex: 0n,
          delegationAmount: { hi: 0n, lo: 1n },
        },
      },
    });

    test('returns the action view as-is', async () => {
      const isControlledAddress = () => Promise.resolve(false);
      const result = await asReceiverActionView(actionView, { isControlledAddress });

      expect(result.equals(actionView)).toBe(true);
    });
  });

  describe('when passed an undelegate action view', () => {
    const actionView = new ActionView({
      actionView: {
        case: 'undelegate',
        value: {
          startEpochIndex: 0n,
          delegationAmount: { hi: 0n, lo: 1n },
        },
      },
    });

    test('returns the action view as-is', async () => {
      const isControlledAddress = () => Promise.resolve(false);
      const result = await asReceiverActionView(actionView, { isControlledAddress });

      expect(result.equals(actionView)).toBe(true);
    });
  });
});
