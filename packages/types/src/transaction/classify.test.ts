import { describe, expect, it } from 'vitest';
import { classifyTransaction } from './classify';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

describe('classifyTransaction()', () => {
  it('returns `receive` for transactions with an opaque spend and a visible output + address', () => {
    const transactionView = new TransactionView({
      bodyView: {
        actionViews: [
          {
            actionView: {
              case: 'spend',
              value: {
                spendView: {
                  case: 'opaque',
                  value: {},
                },
              },
            },
          },
          {
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
                          value: {},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });

    expect(classifyTransaction(transactionView)).toBe('receive');
  });

  it('returns `send` for transactions with visible spends but at least one opaque output', () => {
    const transactionView = new TransactionView({
      bodyView: {
        actionViews: [
          {
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
                          value: {},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          {
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
                          value: {},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          {
            actionView: {
              case: 'output',
              value: {
                outputView: {
                  case: 'visible',
                  value: {
                    note: {
                      address: {
                        addressView: {
                          case: 'opaque',
                          value: {},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });

    expect(classifyTransaction(transactionView)).toBe('send');
  });

  it('returns `internalTransfer` for transactions with fully visible spends, outputs, and addresses', () => {
    const transactionView = new TransactionView({
      bodyView: {
        actionViews: [
          {
            actionView: {
              case: 'spend',
              value: {
                spendView: {
                  case: 'visible',
                  value: {},
                },
              },
            },
          },
          {
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
                          value: {},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          {
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
                          value: {},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });

    expect(classifyTransaction(transactionView)).toBe('internalTransfer');
  });

  it('returns `swap` for transactions with a `swap` action', () => {
    const transactionView = new TransactionView({
      bodyView: {
        actionViews: [
          {
            actionView: {
              case: 'swap',
              value: {},
            },
          },
          {
            actionView: {
              case: 'spend',
              value: {},
            },
          },
          {
            actionView: {
              case: 'output',
              value: {},
            },
          },
        ],
      },
    });

    expect(classifyTransaction(transactionView)).toBe('swap');
  });

  it('returns `swapClaim` for transactions with a `swapClaim` action', () => {
    const transactionView = new TransactionView({
      bodyView: {
        actionViews: [
          {
            actionView: {
              case: 'swapClaim',
              value: {},
            },
          },
          {
            actionView: {
              case: 'output',
              value: {},
            },
          },
        ],
      },
    });

    expect(classifyTransaction(transactionView)).toBe('swapClaim');
  });

  it("returns `unknown` for transactions that don't fit the above categories", () => {
    const transactionView = new TransactionView({
      bodyView: {
        actionViews: [
          {
            actionView: {
              case: 'spend',
              value: {
                spendView: {
                  case: 'visible',
                  value: {},
                },
              },
            },
          },
          {
            actionView: {
              case: 'output',
              value: {
                outputView: {
                  case: 'opaque',
                  value: {},
                },
              },
            },
          },
          {
            actionView: {
              case: 'delegate',
              value: {},
            },
          },
        ],
      },
    });

    expect(classifyTransaction(transactionView)).toBe('unknown');
  });
});
