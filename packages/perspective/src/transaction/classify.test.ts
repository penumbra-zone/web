import { describe, expect, it } from 'vitest';
import { create } from '@bufbuild/protobuf';
import { classifyTransaction } from './classify.js';
import { TransactionViewSchema } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

describe('classifyTransaction()', () => {
  it('returns `receive` for transactions with an opaque spend and a visible output + address', () => {
    const transactionView = create(TransactionViewSchema, {
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

    expect(classifyTransaction(transactionView).type).toBe('receive');
  });

  it('returns `send` for transactions with visible spends but at least one opaque output', () => {
    const transactionView = create(TransactionViewSchema, {
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

    expect(classifyTransaction(transactionView).type).toBe('send');
  });

  it('returns `internalTransfer` for transactions with fully visible spends, outputs, and addresses', () => {
    const transactionView = create(TransactionViewSchema, {
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

    expect(classifyTransaction(transactionView).type).toBe('internalTransfer');
  });

  it('returns `swap` for transactions with a `swap` action', () => {
    const transactionView = create(TransactionViewSchema, {
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

    expect(classifyTransaction(transactionView).type).toBe('swap');
  });

  it('returns `swapClaim` for transactions with a `swapClaim` action', () => {
    const transactionView = create(TransactionViewSchema, {
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

    expect(classifyTransaction(transactionView).type).toBe('swapClaim');
  });

  it('returns `delegate` for transactions with a `delegate` action', () => {
    const transactionView = create(TransactionViewSchema, {
      bodyView: {
        actionViews: [
          {
            actionView: {
              case: 'delegate',
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

    expect(classifyTransaction(transactionView).type).toBe('delegate');
  });

  it('returns `undelegate` for transactions with an `undelegate` action', () => {
    const transactionView = create(TransactionViewSchema, {
      bodyView: {
        actionViews: [
          {
            actionView: {
              case: 'undelegate',
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

    expect(classifyTransaction(transactionView).type).toBe('undelegate');
  });

  it('returns `undelegateClaim` for transactions with an `undelegateClaim` action', () => {
    const transactionView = create(TransactionViewSchema, {
      bodyView: {
        actionViews: [
          {
            actionView: {
              case: 'undelegateClaim',
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

    expect(classifyTransaction(transactionView).type).toBe('undelegateClaim');
  });

  it('returns `dutchAuctionSchedule` for transactions with an `actionDutchAuctionSchedule` action', () => {
    const transactionView = create(TransactionViewSchema, {
      bodyView: {
        actionViews: [{ actionView: { case: 'actionDutchAuctionSchedule', value: {} } }],
      },
    });

    expect(classifyTransaction(transactionView).type).toBe('dutchAuctionSchedule');
  });

  it('returns `dutchAuctionEnd` for transactions with an `actionDutchAuctionEnd` action', () => {
    const transactionView = create(TransactionViewSchema, {
      bodyView: {
        actionViews: [{ actionView: { case: 'actionDutchAuctionEnd', value: {} } }],
      },
    });

    expect(classifyTransaction(transactionView).type).toBe('dutchAuctionEnd');
  });

  it('returns `dutchAuctionWithdraw` for transactions with an `actionDutchAuctionWithdraw` action', () => {
    const transactionView = create(TransactionViewSchema, {
      bodyView: {
        actionViews: [{ actionView: { case: 'actionDutchAuctionWithdraw', value: {} } }],
      },
    });

    expect(classifyTransaction(transactionView).type).toBe('dutchAuctionWithdraw');
  });

  it("returns `unknown` for transactions that don't fit the above categories", () => {
    const transactionView = create(TransactionViewSchema, {
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
              // @ts-expect-error Simulating an unexpected case
              case: 'daoGovernanceVote',
              value: {},
            },
          },
        ],
      },
    });

    expect(classifyTransaction(transactionView).type).toBe('unknown');
  });
});
