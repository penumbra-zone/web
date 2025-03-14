import { ActionViewSchema } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { create, equals } from '@bufbuild/protobuf';
import { asPublicActionView, asReceiverActionView } from './action-view.js';
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
      const publicView = asPublicActionView(
        create(ActionViewSchema, { actionView: { case: undefined } }),
      );
      expect(equals(ActionViewSchema, publicView, create(ActionViewSchema))).toBe(true);
    });
  });

  describe('when passed a spend action view', () => {
    const actionView = create(ActionViewSchema, {
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
      const expected = create(ActionViewSchema, {
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

      expect(equals(ActionViewSchema, asPublicActionView(actionView), expected)).toBe(true);
    });
  });

  describe('when passed an output action view', () => {
    const actionView = create(ActionViewSchema, {
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
      const expected = create(ActionViewSchema, {
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

      expect(equals(ActionViewSchema, asPublicActionView(actionView), expected)).toBe(true);
    });
  });

  describe('when passed a delegate action view', () => {
    const actionView = create(ActionViewSchema, {
      actionView: {
        case: 'delegate',
        value: {
          epochIndex: 0n,
          delegationAmount: { hi: 0n, lo: 1n },
        },
      },
    });

    test('returns the action view as-is', () => {
      expect(equals(ActionViewSchema, asPublicActionView(actionView), actionView)).toBe(true);
    });
  });

  describe('when passed an undelegate action view', () => {
    const actionView = create(ActionViewSchema, {
      actionView: {
        case: 'undelegate',
        value: {
          startEpochIndex: 0n,
          delegationAmount: { hi: 0n, lo: 1n },
        },
      },
    });

    test('returns the action view as-is', () => {
      expect(equals(ActionViewSchema, asPublicActionView(actionView), actionView)).toBe(true);
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
        create(ActionViewSchema, { actionView: { case: undefined } }),
        { isControlledAddress },
      );

      expect(equals(ActionViewSchema, result, create(ActionViewSchema))).toBe(true);
    });
  });

  describe('when passed a spend action view', () => {
    const actionView = create(ActionViewSchema, {
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
      const expected = create(ActionViewSchema, {
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

      expect(equals(ActionViewSchema, result, expected)).toBe(true);
    });
  });

  describe('when passed an output action view', () => {
    const actionView = create(ActionViewSchema, {
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

      expect(equals(ActionViewSchema, result, actionView)).toBe(true);
    });
  });

  describe('when passed a delegate action view', () => {
    const actionView = create(ActionViewSchema, {
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

      expect(equals(ActionViewSchema, result, actionView)).toBe(true);
    });
  });

  describe('when passed an undelegate action view', () => {
    const actionView = create(ActionViewSchema, {
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

      expect(equals(ActionViewSchema, result, actionView)).toBe(true);
    });
  });
});
