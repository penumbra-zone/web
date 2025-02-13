import { useQuery } from '@tanstack/react-query';
import { createClient } from '@connectrpc/connect';
import { ViewService, TendermintProxyService } from '@penumbra-zone/protobuf';
import { getGrpcTransport } from '@/shared/api/transport';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  ActionView,
  MemoView,
  MemoView_Opaque,
  Transaction,
  TransactionBodyView,
  TransactionPerspective,
  TransactionView,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { hexToUint8Array } from '@penumbra-zone/types/hex';
import {
  OutputView,
  OutputView_Opaque,
  SpendView,
  SpendView_Opaque,
} from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  DelegatorVoteView,
  DelegatorVoteView_Opaque,
} from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import {
  SwapClaimView,
  SwapClaimView_Opaque,
  SwapView,
  SwapView_Opaque,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import {
  ActionDutchAuctionScheduleView,
  ActionDutchAuctionWithdrawView,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';

export const useTransactionInfo = (txHash: string, connected: boolean) => {
  return useQuery({
    queryKey: ['transaction', txHash, connected],
    retry: 1,
    queryFn: async () => {
      const grpc = await getGrpcTransport();
      const hash = hexToUint8Array(txHash);

      if (connected) {
        const client = createClient(ViewService, grpc.transport);
        const viewServiceRes = await client.transactionInfoByHash({
          id: new TransactionId({
            inner: hash,
          }),
        });
        return viewServiceRes.txInfo;
      }

      const tendermintClient = createClient(TendermintProxyService, grpc.transport);
      const res = await tendermintClient.getTx({ hash });

      const { tx, height } = res;

      const transaction = Transaction.fromBinary(tx);

      const txInfo = new TransactionInfo({
        height,
        id: new TransactionId({ inner: hash }),
        transaction,
        perspective: new TransactionPerspective({
          transactionId: new TransactionId({ inner: hash }),
        }),
        view: new TransactionView({
          anchor: transaction.anchor,
          bindingSig: transaction.bindingSig,
          bodyView: new TransactionBodyView({
            actionViews: (transaction.body?.actions
              .map(action => {
                const { case: actionCase, value } = action.action;
                switch (actionCase) {
                  case 'spend':
                    return new ActionView({
                      actionView: {
                        case: 'spend',
                        value: new SpendView({
                          spendView: {
                            case: 'opaque',
                            value: new SpendView_Opaque({}),
                          },
                        }),
                      },
                    });

                  case 'output':
                    return new ActionView({
                      actionView: {
                        case: 'output',
                        value: new OutputView({
                          outputView: {
                            case: 'opaque',
                            value: new OutputView_Opaque({}),
                          },
                        }),
                      },
                    });

                  case 'swap':
                    return new ActionView({
                      actionView: {
                        case: 'swap',
                        value: new SwapView({
                          swapView: {
                            case: 'opaque',
                            value: new SwapView_Opaque({}),
                          },
                        }),
                      },
                    });

                  case 'swapClaim':
                    return new ActionView({
                      actionView: {
                        case: 'swapClaim',
                        value: new SwapClaimView({
                          swapClaimView: {
                            case: 'opaque',
                            value: new SwapClaimView_Opaque({}),
                          },
                        }),
                      },
                    });

                  case 'delegatorVote':
                    return new ActionView({
                      actionView: {
                        case: actionCase,
                        value: new DelegatorVoteView({
                          delegatorVote: {
                            case: 'opaque',
                            value: new DelegatorVoteView_Opaque({}),
                          },
                        }),
                      },
                    });

                  case 'validatorDefinition':
                    return new ActionView({
                      actionView: {
                        case: 'validatorDefinition',
                        value,
                      },
                    });

                  case 'ibcRelayAction':
                    return new ActionView({
                      actionView: {
                        case: 'ibcRelayAction',
                        value,
                      },
                    });

                  case 'proposalSubmit':
                    return new ActionView({
                      actionView: {
                        case: 'proposalSubmit',
                        value,
                      },
                    });

                  case 'proposalWithdraw':
                    return new ActionView({
                      actionView: {
                        case: 'proposalWithdraw',
                        value,
                      },
                    });

                  case 'proposalDepositClaim':
                    return new ActionView({
                      actionView: {
                        case: 'proposalDepositClaim',
                        value,
                      },
                    });

                  case 'validatorVote':
                    return new ActionView({
                      actionView: {
                        case: 'validatorVote',
                        value,
                      },
                    });

                  case 'positionOpen':
                    return new ActionView({
                      actionView: {
                        case: 'positionOpen',
                        value,
                      },
                    });

                  case 'positionClose':
                    return new ActionView({
                      actionView: {
                        case: 'positionClose',
                        value,
                      },
                    });

                  case 'positionWithdraw':
                    return new ActionView({
                      actionView: {
                        case: 'positionWithdraw',
                        value,
                      },
                    });

                  case 'positionRewardClaim':
                    return new ActionView({
                      actionView: {
                        case: 'positionRewardClaim',
                        value,
                      },
                    });

                  case 'delegate':
                    return new ActionView({
                      actionView: {
                        case: 'delegate',
                        value,
                      },
                    });

                  case 'undelegate':
                    return new ActionView({
                      actionView: {
                        case: 'undelegate',
                        value,
                      },
                    });

                  case 'communityPoolSpend':
                    return new ActionView({
                      actionView: {
                        case: 'communityPoolSpend',
                        value,
                      },
                    });

                  case 'communityPoolOutput':
                    return new ActionView({
                      actionView: {
                        case: 'communityPoolOutput',
                        value,
                      },
                    });

                  case 'communityPoolDeposit':
                    return new ActionView({
                      actionView: {
                        case: 'communityPoolDeposit',
                        value,
                      },
                    });

                  case 'actionDutchAuctionSchedule':
                    return new ActionView({
                      actionView: {
                        case: 'actionDutchAuctionSchedule',
                        value: new ActionDutchAuctionScheduleView({
                          action: value,
                        }),
                      },
                    });

                  case 'actionDutchAuctionWithdraw':
                    return new ActionView({
                      actionView: {
                        case: 'actionDutchAuctionWithdraw',
                        value: new ActionDutchAuctionWithdrawView({
                          action: value,
                        }),
                      },
                    });

                  case 'actionDutchAuctionEnd':
                    return new ActionView({
                      actionView: {
                        case: 'actionDutchAuctionEnd',
                        value,
                      },
                    });

                  case 'undelegateClaim':
                    return new ActionView({
                      actionView: {
                        case: 'undelegateClaim',
                        value,
                      },
                    });

                  case 'ics20Withdrawal':
                    return new ActionView({
                      actionView: {
                        case: 'ics20Withdrawal',
                        value,
                      },
                    });

                  default:
                    return null;
                }
              })
              .filter(Boolean) ?? []) as ActionView[],
            transactionParameters: transaction.body?.transactionParameters,
            detectionData: transaction.body?.detectionData,
            memoView: new MemoView({
              memoView: {
                case: 'opaque',
                value: new MemoView_Opaque({}),
              },
            }),
          }),
        }),
      });
      return txInfo;
    },
    enabled: !!txHash,
  });
};
