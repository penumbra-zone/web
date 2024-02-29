import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  TransactionInfo,
  TransactionInfoByHashRequest,
  TransactionInfoByHashResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../ctx';
import { IndexedDbMock, MockServices, TendermintMock, ViewServerMock } from './test-utils';
import { transactionInfoByHash } from './transaction-info-by-hash';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import type { Services } from '@penumbra-zone/services';

const mockTransactionInfo = vi.hoisted(() => vi.fn());
vi.mock('@penumbra-zone/wasm', () => ({
  transactionInfo: mockTransactionInfo,
}));
describe('TransactionInfoByHash request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockViewServer: ViewServerMock;
  let mockCtx: HandlerContext;
  let transactionId: TransactionId;
  let mockTendermint: TendermintMock;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getTransactionInfo: vi.fn(),
      constants: vi.fn(),
    };
    mockViewServer = {
      fullViewingKey: vi.fn(),
    };
    mockTendermint = {
      getTransaction: vi.fn(),
    };
    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({
          indexedDb: mockIndexedDb,
          viewServer: mockViewServer,
          querier: {
            tendermint: mockTendermint,
          },
        }),
      ),
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.transactionInfoByHash,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, mockServices as unknown as Services),
    });
    mockViewServer.fullViewingKey?.mockReturnValueOnce(
      'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09',
    );
    transactionId = TransactionId.fromJson({
      inner: 'v5fO5kM6B/VYpaLyy/cXvlqtSb4/i8WWlwbfrSPTDlI=',
    });
  });

  test('should get TransactionInfo from indexed-db if there is a record in indexed-db', async () => {
    mockIndexedDb.getTransactionInfo?.mockResolvedValue(transactionInfoDbData);
    const txInfoByHashResponse = new TransactionInfoByHashResponse(
      await transactionInfoByHash(new TransactionInfoByHashRequest({ id: transactionId }), mockCtx),
    );

    expect(txInfoByHashResponse.txInfo?.equals(transactionInfoDbData)).toBeTruthy();
  });

  test('should get TransactionInfo from tendermint if  record is not found in indexed-db', async () => {
    mockIndexedDb.getTransactionInfo?.mockResolvedValue(undefined);
    mockTendermint.getTransaction?.mockResolvedValue({
      height: transactionInfoTendermintData.height,
      transaction: transactionInfoTendermintData.transaction,
    });
    mockTransactionInfo.mockReturnValueOnce({
      txp: transactionInfoTendermintData.perspective,
      txv: transactionInfoTendermintData.view,
    });

    const txInfoByHashResponse = new TransactionInfoByHashResponse(
      await transactionInfoByHash(new TransactionInfoByHashRequest({ id: transactionId }), mockCtx),
    );
    expect(txInfoByHashResponse.txInfo?.equals(transactionInfoTendermintData)).toBeTruthy();
  });

  test('should get an error if TransactionId is not passed', async () => {
    await expect(
      transactionInfoByHash(new TransactionInfoByHashRequest(), mockCtx),
    ).rejects.toThrow('Missing transaction ID in request');
  });
});

const transactionInfoTendermintData = TransactionInfo.fromJson({
  height: '8664',
  id: {
    inner: 'v5fO5kM6B/VYpaLyy/cXvlqtSb4/i8WWlwbfrSPTDlI=',
  },
  transaction: {
    body: {
      actions: [
        {
          output: {
            body: {
              notePayload: {
                noteCommitment: {
                  inner: 'VxJkYflpkJKddFzcvB0r81ZdyEBY3ar1ixW405l/rwM=',
                },
                ephemeralKey: 'glXyMr+5esBZGdX3VBq9eouX31rR+x16HhB8ZKzA6ww=',
                encryptedNote: {
                  inner:
                    'pq0A9/dYLjHlXNXh+OcGVHAbT2rFJWqz1BAonq77jVCs0fp0G726mokatGp22BkBSkyCpYzhLng4pqz9NRpDJvzGGZVJqkOWWq4eyQZgCymjTeGTI2j2rFt3GbkoFByyUNezwYV3wNdYmq9HwY9qkkSROjzEXp6x9sNYY19xB4uDAIEEJ57oDzsaO/qNrCnsE8UmlYMjJRcP9IvBySQ1PAhbdckrsJkoDiD2WZ+4Elk=',
                },
              },
              balanceCommitment: {
                inner: 'jORWdUta04bYg75Fb4yV0meiO+XlH5AitF2AZ+g2BQU=',
              },
              wrappedMemoKey: 'f7q2mb0bL1bSKX9b6YZ77Y58+tQ07r3Id80RM5WzryWTnt2t5obqCOcLonXLO3bg',
              ovkWrappedKey: 'PWegX3A+huNHMqX/J0pthNP/2C02BMyDZrqBzH3sGxI6SU0eT7+sM9lDV43DefSo',
            },
            proof: {
              inner:
                'rO1LrPqAha58cQtoL7UTtl23cju65ae7vFlwJre1ZjUq35Vp2pLQcAO9T9ujzSoBdvViLmyFzeh0+B7/MFwCmJ+zyIEjAYpOwBwu92UNAfUdawv+ScSY6XE+vgLAXCgAGzEjV5sSD0byaj65J85piBAUCwbvRkpHFlmKVxfe6qATcedSs7MZXhDdrW6HgrqAIYiHJn5gTYfUjOwnpNBaQkOIm11SoHrohjdMLhihv7/O2F7SNkYltw62A6Qc7TKB',
            },
          },
        },
        {
          spend: {
            body: {
              balanceCommitment: {
                inner: 'wuR6JewcTPhnBzmMUTNcGjcTUqDApPN/HXYQGw32IQI=',
              },
              nullifier: {
                inner: 'HwxySpKV8nuDyQW0sHavb8k1hjBU6y35y7LfmYAbnQ4=',
              },
              rk: {
                inner: 'LuDiuan9I6R3tJsQIHFuG128OojxsZ44s4PPcaARUgc=',
              },
            },
            authSig: {
              inner:
                'Nk8XwaFeRYjatcWyk05CVi9gTTh0RckTtfp3RNHT3QdzwRr2GxXjiz1y6puTsph0aU68R+2Qdpcp7kpoV7TZAA==',
            },
            proof: {
              inner:
                'vhq7Hw4l3Ff5CmY88nqRfmH7Yn8U+Thg74a/H8fPdqvLpEyuzt8c5EZXznyRaaiAv0zk7CfCoE07gXm4SSJiVM9eJfyNGwi2HrBRENX0GQSGGAMs674Fbm6u0CJLIgkAB41KMakBiNE6ovlw1lHYIQXC4QyUV0sCTPHZv8YquG40L7PNRET5ipCsrYffFaqB8UTMkNJg/Kegz0k/mI4Nrz7T7OAF/1snTsQ+spDjTfUw6rckmS8VOASlLjputN+A',
            },
          },
        },
        {
          spend: {
            body: {
              balanceCommitment: {
                inner: 'rqbOMGjlC6+bAOvEM62zZoFePVDuiziyCIZEeWYDAhA=',
              },
              nullifier: {
                inner: 'E/bOScHoO2Lka4n89fHq4iJHFkeRuy1P+vcyVHN4PRE=',
              },
              rk: {
                inner: 'LsLGKRp22uQkybzmiIXh+NM2n38JVvZvfxGYmK7lNwA=',
              },
            },
            authSig: {
              inner:
                'KsJpO4aqv6mjjFWJX6g8KMDNMi2xf9nzri9l2bFT7QlCffCaAhr3DjNsiJdoAx4Y58k7tP9CUbj3yeX5RuTKAg==',
            },
            proof: {
              inner:
                'SsOCfPgz7Iyr4ZJ69xsr28VZbfGiYFSiuFlOKoPxWeMOnEeZqpFk+9/bmAf1UzOBGA03Byh4edilYDhwVNYQKh7VKgtWRQjQCs8KrVRyZ1lHI8jKc/NDrHcwaHpqfGIBsCXrbc3vyjeKlVhFkC9p7WGNEY0yUHIzdxMTBP9NJ4YauJ4Zk/dOIjY4NxTDk1GAx5KjCnZmn9Ux7B3Y/q7yArWb7QRiri6qEshPAFWhQOmqaYPzLuSbjsa0XByhHqEA',
            },
          },
        },
        {
          output: {
            body: {
              notePayload: {
                noteCommitment: {
                  inner: '3FTx6D+IH8RBr5VuJTak34oHtGk+cu/zMDK32Kb8wAQ=',
                },
                ephemeralKey: 'uk9Ctf0KcBRsErY5GpSBVjtFj+vlDom0ljSmwqaspQ8=',
                encryptedNote: {
                  inner:
                    'PM7/bjyXmV6xaWnwEWxsULs4F06fxmkAjMI5H5TC1BExYQVecJvmcI9RtxRuwMJQdb4opX0y7H2JdypVPhKr3Rl3Ngjw+GdtAP/PBuhW2ftNj/RkY5qQKXB7GqRF19gvkbHaLGZp42Aw8zWF9ba7kU01uTbfh2dpJQZIVSAdSQnWBLcs2u747mK4zKwMaxlssCX0vvjL0dYrtaPjmSFySe8EVL7iLJg7zzoENA7pJzc=',
                },
              },
              balanceCommitment: {
                inner: 'BoQIdVlbLjgzjoMFFq9/DfH6749Rl+sDC6EhLJlGZRI=',
              },
              wrappedMemoKey: 'yLlXMEeghEa7HxQOh6MQGlzz8CruMZPuVA3ULj4qs9WK3OgsX7bftyPkYmjZ7Yft',
              ovkWrappedKey: 'LX7h8SsJ/zJFGSc9Gc/rlCi3ZTHp3ABe9fvfpwitRvL8viZe80aModXq/ri3c3qE',
            },
            proof: {
              inner:
                'XHxrJbh21801r8tfC2Ryhe7wmxTfCa9S3WuXFdWYEkUlRvj4KD0t8xafnNUbfeyAGqb7D9vTf+6v3hmz+5TYPStcXJqbknyHGb7dFPrpNJeXn3IM+530BBg0BKCSbXsABbv5GEA1Lbnt6JX08r7qf6eupMGT7SqoYaURwcChnI5NDX6IaRL8QOXD7ofUeysBb+mD4e0jWt2Xr2ANl1EMrsgl7lCWkp5mnQ4M/DYS4i3P3s3JUoYG9h9nbfhE1CkA',
            },
          },
        },
      ],
      transactionParameters: {
        chainId: 'penumbra-testnet-deimos',
        fee: {
          amount: {},
        },
      },
      detectionData: {
        fmdClues: [
          {
            inner:
              '4sbjmNOe3fKz96wEUJR3r6opa4MSwFFeZAgjG1UZNRJcn/LpOc+ZKMj1ZozM/E6Q8agIZRKrY94NCjoU5vfVAgAAAAA=',
          },
          {
            inner:
              'JBC0c08hfc6BoI2DPpxkrw7L+s+s3XCPpM842sLCOA262Af3+6kW5RTsnRWIQ+h2IcqGUJWrNPkZzibglM02BAAAAAA=',
          },
        ],
      },
      memo: {
        inner:
          'Ne9LOPmWu+oeMWtF2bCd2fgKu8UTeJyi4f2dqmsUSe78Jigz4sBELgFQwyO/9byAG2b2crdsXwyUrLS8/D3z5YXkizaFNFDJ180Bc3F3p+7wS1wi6cRzM18tJCtD9eCSZtIPru/B5fbP0NFt7X/UHVf5IWPpzM4TwlF6E1S8phcSOQIvybc+nLKfVVuyo+gcnPGGx3SJAoK3NozxrA7tcLlMbKB0X9I2kHg2qv9sdvYASCLOEk9z2ylAQLvPKrwTnUzv+WDsuIi48+llhYp/RCQS0dYryrIzTKf5s6OPNjteImDKI6Ze7csuNAtWQg/FtcQrm6Nfpvg1AYHjk/cbaJdLnXDwg/IJL5dlxlxX6Wr+6JFpLrE/Xi7mfg6F6qwcHAFj3uKEKNzFiWb9Yv0NklSCq7G5kculVYD8xgwHjorI+ldpI4KxHcBDTjpnTzKEgVg98OofskYOp6UqxKJioo7BMTAmb8RqfobzVrqbZypLhaDcyvZtWE9MFw13sopV4WkRtNhsZdTmOfsa2SrOHjAywFdyrdDrLSy8byBY2WtWfJWM5YreSrAR4QPF9PLHslM0WKuvR2naldVVqy/Qkzk1kyF+6lk+hwfrFxE8oGuFf4hoa/mIT9BLkejR/bmQl+aulziKClKzKOLqIcRwhRFa1rcTd2WAn+wWmaV3i7HNevrHqxQJ+Th8/qZObM9L',
      },
    },
    bindingSig: {
      inner:
        'opEm2HzD29Kie5TkVmEpxHa/wpF4I0mW5CfLCz+GOwI2cHe46BPyWjz8COZekiCc1VECYEeQXe1a/leNyRixAA==',
    },
    anchor: {
      inner: 'pO/o5BB9FaNnk69lszgtX+DeJtw3jNjXXC81XERcUQY=',
    },
  },
  perspective: {
    payloadKeys: [
      {
        payloadKey: {
          inner: 'tXxc7JUZT1HcboC07cMUUumUKvhJGfv+Izp6Fjq13iQ=',
        },
        commitment: {
          inner: 'VxJkYflpkJKddFzcvB0r81ZdyEBY3ar1ixW405l/rwM=',
        },
      },
      {
        payloadKey: {
          inner: 'SLpi6Ub0ltYRjUhdvn82j4SejwPI23kpMS30yiyXkXw=',
        },
        commitment: {
          inner: '3FTx6D+IH8RBr5VuJTak34oHtGk+cu/zMDK32Kb8wAQ=',
        },
      },
    ],
    transactionId: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    },
  },
  view: {
    bodyView: {
      actionViews: [
        {
          output: {
            opaque: {
              output: {
                body: {
                  notePayload: {
                    noteCommitment: {
                      inner: 'VxJkYflpkJKddFzcvB0r81ZdyEBY3ar1ixW405l/rwM=',
                    },
                    ephemeralKey: 'glXyMr+5esBZGdX3VBq9eouX31rR+x16HhB8ZKzA6ww=',
                    encryptedNote: {
                      inner:
                        'pq0A9/dYLjHlXNXh+OcGVHAbT2rFJWqz1BAonq77jVCs0fp0G726mokatGp22BkBSkyCpYzhLng4pqz9NRpDJvzGGZVJqkOWWq4eyQZgCymjTeGTI2j2rFt3GbkoFByyUNezwYV3wNdYmq9HwY9qkkSROjzEXp6x9sNYY19xB4uDAIEEJ57oDzsaO/qNrCnsE8UmlYMjJRcP9IvBySQ1PAhbdckrsJkoDiD2WZ+4Elk=',
                    },
                  },
                  balanceCommitment: {
                    inner: 'jORWdUta04bYg75Fb4yV0meiO+XlH5AitF2AZ+g2BQU=',
                  },
                  wrappedMemoKey:
                    'f7q2mb0bL1bSKX9b6YZ77Y58+tQ07r3Id80RM5WzryWTnt2t5obqCOcLonXLO3bg',
                  ovkWrappedKey: 'PWegX3A+huNHMqX/J0pthNP/2C02BMyDZrqBzH3sGxI6SU0eT7+sM9lDV43DefSo',
                },
                proof: {
                  inner:
                    'rO1LrPqAha58cQtoL7UTtl23cju65ae7vFlwJre1ZjUq35Vp2pLQcAO9T9ujzSoBdvViLmyFzeh0+B7/MFwCmJ+zyIEjAYpOwBwu92UNAfUdawv+ScSY6XE+vgLAXCgAGzEjV5sSD0byaj65J85piBAUCwbvRkpHFlmKVxfe6qATcedSs7MZXhDdrW6HgrqAIYiHJn5gTYfUjOwnpNBaQkOIm11SoHrohjdMLhihv7/O2F7SNkYltw62A6Qc7TKB',
                },
              },
            },
          },
        },
        {
          spend: {
            opaque: {
              spend: {
                body: {
                  balanceCommitment: {
                    inner: 'wuR6JewcTPhnBzmMUTNcGjcTUqDApPN/HXYQGw32IQI=',
                  },
                  nullifier: {
                    inner: 'HwxySpKV8nuDyQW0sHavb8k1hjBU6y35y7LfmYAbnQ4=',
                  },
                  rk: {
                    inner: 'LuDiuan9I6R3tJsQIHFuG128OojxsZ44s4PPcaARUgc=',
                  },
                },
                authSig: {
                  inner:
                    'Nk8XwaFeRYjatcWyk05CVi9gTTh0RckTtfp3RNHT3QdzwRr2GxXjiz1y6puTsph0aU68R+2Qdpcp7kpoV7TZAA==',
                },
                proof: {
                  inner:
                    'vhq7Hw4l3Ff5CmY88nqRfmH7Yn8U+Thg74a/H8fPdqvLpEyuzt8c5EZXznyRaaiAv0zk7CfCoE07gXm4SSJiVM9eJfyNGwi2HrBRENX0GQSGGAMs674Fbm6u0CJLIgkAB41KMakBiNE6ovlw1lHYIQXC4QyUV0sCTPHZv8YquG40L7PNRET5ipCsrYffFaqB8UTMkNJg/Kegz0k/mI4Nrz7T7OAF/1snTsQ+spDjTfUw6rckmS8VOASlLjputN+A',
                },
              },
            },
          },
        },
        {
          spend: {
            opaque: {
              spend: {
                body: {
                  balanceCommitment: {
                    inner: 'rqbOMGjlC6+bAOvEM62zZoFePVDuiziyCIZEeWYDAhA=',
                  },
                  nullifier: {
                    inner: 'E/bOScHoO2Lka4n89fHq4iJHFkeRuy1P+vcyVHN4PRE=',
                  },
                  rk: {
                    inner: 'LsLGKRp22uQkybzmiIXh+NM2n38JVvZvfxGYmK7lNwA=',
                  },
                },
                authSig: {
                  inner:
                    'KsJpO4aqv6mjjFWJX6g8KMDNMi2xf9nzri9l2bFT7QlCffCaAhr3DjNsiJdoAx4Y58k7tP9CUbj3yeX5RuTKAg==',
                },
                proof: {
                  inner:
                    'SsOCfPgz7Iyr4ZJ69xsr28VZbfGiYFSiuFlOKoPxWeMOnEeZqpFk+9/bmAf1UzOBGA03Byh4edilYDhwVNYQKh7VKgtWRQjQCs8KrVRyZ1lHI8jKc/NDrHcwaHpqfGIBsCXrbc3vyjeKlVhFkC9p7WGNEY0yUHIzdxMTBP9NJ4YauJ4Zk/dOIjY4NxTDk1GAx5KjCnZmn9Ux7B3Y/q7yArWb7QRiri6qEshPAFWhQOmqaYPzLuSbjsa0XByhHqEA',
                },
              },
            },
          },
        },
        {
          output: {
            opaque: {
              output: {
                body: {
                  notePayload: {
                    noteCommitment: {
                      inner: '3FTx6D+IH8RBr5VuJTak34oHtGk+cu/zMDK32Kb8wAQ=',
                    },
                    ephemeralKey: 'uk9Ctf0KcBRsErY5GpSBVjtFj+vlDom0ljSmwqaspQ8=',
                    encryptedNote: {
                      inner:
                        'PM7/bjyXmV6xaWnwEWxsULs4F06fxmkAjMI5H5TC1BExYQVecJvmcI9RtxRuwMJQdb4opX0y7H2JdypVPhKr3Rl3Ngjw+GdtAP/PBuhW2ftNj/RkY5qQKXB7GqRF19gvkbHaLGZp42Aw8zWF9ba7kU01uTbfh2dpJQZIVSAdSQnWBLcs2u747mK4zKwMaxlssCX0vvjL0dYrtaPjmSFySe8EVL7iLJg7zzoENA7pJzc=',
                    },
                  },
                  balanceCommitment: {
                    inner: 'BoQIdVlbLjgzjoMFFq9/DfH6749Rl+sDC6EhLJlGZRI=',
                  },
                  wrappedMemoKey:
                    'yLlXMEeghEa7HxQOh6MQGlzz8CruMZPuVA3ULj4qs9WK3OgsX7bftyPkYmjZ7Yft',
                  ovkWrappedKey: 'LX7h8SsJ/zJFGSc9Gc/rlCi3ZTHp3ABe9fvfpwitRvL8viZe80aModXq/ri3c3qE',
                },
                proof: {
                  inner:
                    'XHxrJbh21801r8tfC2Ryhe7wmxTfCa9S3WuXFdWYEkUlRvj4KD0t8xafnNUbfeyAGqb7D9vTf+6v3hmz+5TYPStcXJqbknyHGb7dFPrpNJeXn3IM+530BBg0BKCSbXsABbv5GEA1Lbnt6JX08r7qf6eupMGT7SqoYaURwcChnI5NDX6IaRL8QOXD7ofUeysBb+mD4e0jWt2Xr2ANl1EMrsgl7lCWkp5mnQ4M/DYS4i3P3s3JUoYG9h9nbfhE1CkA',
                },
              },
            },
          },
        },
      ],
      transactionParameters: {
        chainId: 'penumbra-testnet-deimos',
        fee: {
          amount: {},
        },
      },
      detectionData: {
        fmdClues: [
          {
            inner:
              '4sbjmNOe3fKz96wEUJR3r6opa4MSwFFeZAgjG1UZNRJcn/LpOc+ZKMj1ZozM/E6Q8agIZRKrY94NCjoU5vfVAgAAAAA=',
          },
          {
            inner:
              'JBC0c08hfc6BoI2DPpxkrw7L+s+s3XCPpM842sLCOA262Af3+6kW5RTsnRWIQ+h2IcqGUJWrNPkZzibglM02BAAAAAA=',
          },
        ],
      },
      memoView: {
        opaque: {
          ciphertext: {
            inner:
              'Ne9LOPmWu+oeMWtF2bCd2fgKu8UTeJyi4f2dqmsUSe78Jigz4sBELgFQwyO/9byAG2b2crdsXwyUrLS8/D3z5YXkizaFNFDJ180Bc3F3p+7wS1wi6cRzM18tJCtD9eCSZtIPru/B5fbP0NFt7X/UHVf5IWPpzM4TwlF6E1S8phcSOQIvybc+nLKfVVuyo+gcnPGGx3SJAoK3NozxrA7tcLlMbKB0X9I2kHg2qv9sdvYASCLOEk9z2ylAQLvPKrwTnUzv+WDsuIi48+llhYp/RCQS0dYryrIzTKf5s6OPNjteImDKI6Ze7csuNAtWQg/FtcQrm6Nfpvg1AYHjk/cbaJdLnXDwg/IJL5dlxlxX6Wr+6JFpLrE/Xi7mfg6F6qwcHAFj3uKEKNzFiWb9Yv0NklSCq7G5kculVYD8xgwHjorI+ldpI4KxHcBDTjpnTzKEgVg98OofskYOp6UqxKJioo7BMTAmb8RqfobzVrqbZypLhaDcyvZtWE9MFw13sopV4WkRtNhsZdTmOfsa2SrOHjAywFdyrdDrLSy8byBY2WtWfJWM5YreSrAR4QPF9PLHslM0WKuvR2naldVVqy/Qkzk1kyF+6lk+hwfrFxE8oGuFf4hoa/mIT9BLkejR/bmQl+aulziKClKzKOLqIcRwhRFa1rcTd2WAn+wWmaV3i7HNevrHqxQJ+Th8/qZObM9L',
          },
        },
      },
    },
    bindingSig: {
      inner:
        'opEm2HzD29Kie5TkVmEpxHa/wpF4I0mW5CfLCz+GOwI2cHe46BPyWjz8COZekiCc1VECYEeQXe1a/leNyRixAA==',
    },
    anchor: {
      inner: 'pO/o5BB9FaNnk69lszgtX+DeJtw3jNjXXC81XERcUQY=',
    },
  },
});

const transactionInfoDbData = TransactionInfo.fromJson({
  height: '8664',
  id: {
    inner: 'v5fO5kM6B/VYpaLyy/cXvlqtSb4/i8WWlwbfrSPTDlI=',
  },
  transaction: {
    body: {
      actions: [
        {
          output: {
            body: {
              notePayload: {
                noteCommitment: {
                  inner: 'VxJkYflpkJKddFzcvB0r81ZdyEBY3ar1ixW405l/rwM=',
                },
                ephemeralKey: 'glXyMr+5esBZGdX3VBq9eouX31rR+x16HhB8ZKzA6ww=',
                encryptedNote: {
                  inner:
                    'pq0A9/dYLjHlXNXh+OcGVHAbT2rFJWqz1BAonq77jVCs0fp0G726mokatGp22BkBSkyCpYzhLng4pqz9NRpDJvzGGZVJqkOWWq4eyQZgCymjTeGTI2j2rFt3GbkoFByyUNezwYV3wNdYmq9HwY9qkkSROjzEXp6x9sNYY19xB4uDAIEEJ57oDzsaO/qNrCnsE8UmlYMjJRcP9IvBySQ1PAhbdckrsJkoDiD2WZ+4Elk=',
                },
              },
              balanceCommitment: {
                inner: 'jORWdUta04bYg75Fb4yV0meiO+XlH5AitF2AZ+g2BQU=',
              },
              wrappedMemoKey: 'f7q2mb0bL1bSKX9b6YZ77Y58+tQ07r3Id80RM5WzryWTnt2t5obqCOcLonXLO3bg',
              ovkWrappedKey: 'PWegX3A+huNHMqX/J0pthNP/2C02BMyDZrqBzH3sGxI6SU0eT7+sM9lDV43DefSo',
            },
            proof: {
              inner:
                'rO1LrPqAha58cQtoL7UTtl23cju65ae7vFlwJre1ZjUq35Vp2pLQcAO9T9ujzSoBdvViLmyFzeh0+B7/MFwCmJ+zyIEjAYpOwBwu92UNAfUdawv+ScSY6XE+vgLAXCgAGzEjV5sSD0byaj65J85piBAUCwbvRkpHFlmKVxfe6qATcedSs7MZXhDdrW6HgrqAIYiHJn5gTYfUjOwnpNBaQkOIm11SoHrohjdMLhihv7/O2F7SNkYltw62A6Qc7TKB',
            },
          },
        },
        {
          spend: {
            body: {
              balanceCommitment: {
                inner: 'wuR6JewcTPhnBzmMUTNcGjcTUqDApPN/HXYQGw32IQI=',
              },
              nullifier: {
                inner: 'HwxySpKV8nuDyQW0sHavb8k1hjBU6y35y7LfmYAbnQ4=',
              },
              rk: {
                inner: 'LuDiuan9I6R3tJsQIHFuG128OojxsZ44s4PPcaARUgc=',
              },
            },
            authSig: {
              inner:
                'Nk8XwaFeRYjatcWyk05CVi9gTTh0RckTtfp3RNHT3QdzwRr2GxXjiz1y6puTsph0aU68R+2Qdpcp7kpoV7TZAA==',
            },
            proof: {
              inner:
                'vhq7Hw4l3Ff5CmY88nqRfmH7Yn8U+Thg74a/H8fPdqvLpEyuzt8c5EZXznyRaaiAv0zk7CfCoE07gXm4SSJiVM9eJfyNGwi2HrBRENX0GQSGGAMs674Fbm6u0CJLIgkAB41KMakBiNE6ovlw1lHYIQXC4QyUV0sCTPHZv8YquG40L7PNRET5ipCsrYffFaqB8UTMkNJg/Kegz0k/mI4Nrz7T7OAF/1snTsQ+spDjTfUw6rckmS8VOASlLjputN+A',
            },
          },
        },
        {
          spend: {
            body: {
              balanceCommitment: {
                inner: 'rqbOMGjlC6+bAOvEM62zZoFePVDuiziyCIZEeWYDAhA=',
              },
              nullifier: {
                inner: 'E/bOScHoO2Lka4n89fHq4iJHFkeRuy1P+vcyVHN4PRE=',
              },
              rk: {
                inner: 'LsLGKRp22uQkybzmiIXh+NM2n38JVvZvfxGYmK7lNwA=',
              },
            },
            authSig: {
              inner:
                'KsJpO4aqv6mjjFWJX6g8KMDNMi2xf9nzri9l2bFT7QlCffCaAhr3DjNsiJdoAx4Y58k7tP9CUbj3yeX5RuTKAg==',
            },
            proof: {
              inner:
                'SsOCfPgz7Iyr4ZJ69xsr28VZbfGiYFSiuFlOKoPxWeMOnEeZqpFk+9/bmAf1UzOBGA03Byh4edilYDhwVNYQKh7VKgtWRQjQCs8KrVRyZ1lHI8jKc/NDrHcwaHpqfGIBsCXrbc3vyjeKlVhFkC9p7WGNEY0yUHIzdxMTBP9NJ4YauJ4Zk/dOIjY4NxTDk1GAx5KjCnZmn9Ux7B3Y/q7yArWb7QRiri6qEshPAFWhQOmqaYPzLuSbjsa0XByhHqEA',
            },
          },
        },
        {
          output: {
            body: {
              notePayload: {
                noteCommitment: {
                  inner: '3FTx6D+IH8RBr5VuJTak34oHtGk+cu/zMDK32Kb8wAQ=',
                },
                ephemeralKey: 'uk9Ctf0KcBRsErY5GpSBVjtFj+vlDom0ljSmwqaspQ8=',
                encryptedNote: {
                  inner:
                    'PM7/bjyXmV6xaWnwEWxsULs4F06fxmkAjMI5H5TC1BExYQVecJvmcI9RtxRuwMJQdb4opX0y7H2JdypVPhKr3Rl3Ngjw+GdtAP/PBuhW2ftNj/RkY5qQKXB7GqRF19gvkbHaLGZp42Aw8zWF9ba7kU01uTbfh2dpJQZIVSAdSQnWBLcs2u747mK4zKwMaxlssCX0vvjL0dYrtaPjmSFySe8EVL7iLJg7zzoENA7pJzc=',
                },
              },
              balanceCommitment: {
                inner: 'BoQIdVlbLjgzjoMFFq9/DfH6749Rl+sDC6EhLJlGZRI=',
              },
              wrappedMemoKey: 'yLlXMEeghEa7HxQOh6MQGlzz8CruMZPuVA3ULj4qs9WK3OgsX7bftyPkYmjZ7Yft',
              ovkWrappedKey: 'LX7h8SsJ/zJFGSc9Gc/rlCi3ZTHp3ABe9fvfpwitRvL8viZe80aModXq/ri3c3qE',
            },
            proof: {
              inner:
                'XHxrJbh21801r8tfC2Ryhe7wmxTfCa9S3WuXFdWYEkUlRvj4KD0t8xafnNUbfeyAGqb7D9vTf+6v3hmz+5TYPStcXJqbknyHGb7dFPrpNJeXn3IM+530BBg0BKCSbXsABbv5GEA1Lbnt6JX08r7qf6eupMGT7SqoYaURwcChnI5NDX6IaRL8QOXD7ofUeysBb+mD4e0jWt2Xr2ANl1EMrsgl7lCWkp5mnQ4M/DYS4i3P3s3JUoYG9h9nbfhE1CkA',
            },
          },
        },
      ],
      transactionParameters: {
        chainId: 'penumbra-testnet-deimos',
        fee: {
          amount: {},
        },
      },
      detectionData: {
        fmdClues: [
          {
            inner:
              '4sbjmNOe3fKz96wEUJR3r6opa4MSwFFeZAgjG1UZNRJcn/LpOc+ZKMj1ZozM/E6Q8agIZRKrY94NCjoU5vfVAgAAAAA=',
          },
          {
            inner:
              'JBC0c08hfc6BoI2DPpxkrw7L+s+s3XCPpM842sLCOA262Af3+6kW5RTsnRWIQ+h2IcqGUJWrNPkZzibglM02BAAAAAA=',
          },
        ],
      },
      memo: {
        inner:
          'Ne9LOPmWu+oeMWtF2bCd2fgKu8UTeJyi4f2dqmsUSe78Jigz4sBELgFQwyO/9byAG2b2crdsXwyUrLS8/D3z5YXkizaFNFDJ180Bc3F3p+7wS1wi6cRzM18tJCtD9eCSZtIPru/B5fbP0NFt7X/UHVf5IWPpzM4TwlF6E1S8phcSOQIvybc+nLKfVVuyo+gcnPGGx3SJAoK3NozxrA7tcLlMbKB0X9I2kHg2qv9sdvYASCLOEk9z2ylAQLvPKrwTnUzv+WDsuIi48+llhYp/RCQS0dYryrIzTKf5s6OPNjteImDKI6Ze7csuNAtWQg/FtcQrm6Nfpvg1AYHjk/cbaJdLnXDwg/IJL5dlxlxX6Wr+6JFpLrE/Xi7mfg6F6qwcHAFj3uKEKNzFiWb9Yv0NklSCq7G5kculVYD8xgwHjorI+ldpI4KxHcBDTjpnTzKEgVg98OofskYOp6UqxKJioo7BMTAmb8RqfobzVrqbZypLhaDcyvZtWE9MFw13sopV4WkRtNhsZdTmOfsa2SrOHjAywFdyrdDrLSy8byBY2WtWfJWM5YreSrAR4QPF9PLHslM0WKuvR2naldVVqy/Qkzk1kyF+6lk+hwfrFxE8oGuFf4hoa/mIT9BLkejR/bmQl+aulziKClKzKOLqIcRwhRFa1rcTd2WAn+wWmaV3i7HNevrHqxQJ+Th8/qZObM9L',
      },
    },
    bindingSig: {
      inner:
        'opEm2HzD29Kie5TkVmEpxHa/wpF4I0mW5CfLCz+GOwI2cHe46BPyWjz8COZekiCc1VECYEeQXe1a/leNyRixAA==',
    },
    anchor: {
      inner: 'pO/o5BB9FaNnk69lszgtX+DeJtw3jNjXXC81XERcUQY=',
    },
  },
  perspective: {
    payloadKeys: [
      {
        payloadKey: {
          inner: 'U8O8tIBK9e7S1Y7mUD0d/N+H0BVHodzGRcEqVGfVF4Y=',
        },
        commitment: {
          inner: 'VxJkYflpkJKddFzcvB0r81ZdyEBY3ar1ixW405l/rwM=',
        },
      },
      {
        payloadKey: {
          inner: 'HcmEUQWCiv6C3/TNYSRilKybwFwMbewLxnPy4gftrnY=',
        },
        commitment: {
          inner: '3FTx6D+IH8RBr5VuJTak34oHtGk+cu/zMDK32Kb8wAQ=',
        },
      },
    ],
    spendNullifiers: [
      {
        nullifier: {
          inner: 'HwxySpKV8nuDyQW0sHavb8k1hjBU6y35y7LfmYAbnQ4=',
        },
        note: {
          value: {
            amount: {
              lo: '100000000',
            },
            assetId: {
              inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
            },
          },
          rseed: 'vUJtQfVxGbO94sx7XEl9KEhj45tLYG3bfkRthhJ1ANk=',
          address: {
            inner:
              'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
          },
        },
      },
      {
        nullifier: {
          inner: 'E/bOScHoO2Lka4n89fHq4iJHFkeRuy1P+vcyVHN4PRE=',
        },
        note: {
          value: {
            amount: {
              lo: '1000000000000',
            },
            assetId: {
              inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
            },
          },
          rseed: 'jCEQAuhjC0cHna9WRD8jM7TmuuJC8o40L4QXKs+vqk4=',
          address: {
            inner:
              'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
          },
        },
      },
    ],
    addressViews: [
      {
        decoded: {
          address: {
            inner:
              'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
          },
          index: {},
          walletId: {
            inner: 'Li7TyAOekHmcqUg7L22BoiYj8XPOkq7/dW/Nd71rkQA=',
          },
        },
      },
      {
        decoded: {
          address: {
            inner:
              'Y+RJoOIOZZGkGqIM2eCrYhhKz5jpWK+4kPRpsuc8MTC8s75ce9e3qhS68FTQAzHdQ4ZenpQAlrGNwTp/XiDKYfCpNNUiDtE0hYlL+9BGhSE=',
          },
          index: {
            account: 1,
          },
          walletId: {
            inner: 'Li7TyAOekHmcqUg7L22BoiYj8XPOkq7/dW/Nd71rkQA=',
          },
        },
      },
    ],
    denoms: [
      {
        denomUnits: [
          {
            denom: 'penumbra',
            exponent: 6,
          },
          {
            denom: 'mpenumbra',
            exponent: 3,
          },
          {
            denom: 'upenumbra',
          },
        ],
        base: 'upenumbra',
        display: 'penumbra',
        penumbraAssetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
    ],
    transactionId: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    },
  },
  view: {
    bodyView: {
      actionViews: [
        {
          output: {
            visible: {
              output: {
                body: {
                  notePayload: {
                    noteCommitment: {
                      inner: 'VxJkYflpkJKddFzcvB0r81ZdyEBY3ar1ixW405l/rwM=',
                    },
                    ephemeralKey: 'glXyMr+5esBZGdX3VBq9eouX31rR+x16HhB8ZKzA6ww=',
                    encryptedNote: {
                      inner:
                        'pq0A9/dYLjHlXNXh+OcGVHAbT2rFJWqz1BAonq77jVCs0fp0G726mokatGp22BkBSkyCpYzhLng4pqz9NRpDJvzGGZVJqkOWWq4eyQZgCymjTeGTI2j2rFt3GbkoFByyUNezwYV3wNdYmq9HwY9qkkSROjzEXp6x9sNYY19xB4uDAIEEJ57oDzsaO/qNrCnsE8UmlYMjJRcP9IvBySQ1PAhbdckrsJkoDiD2WZ+4Elk=',
                    },
                  },
                  balanceCommitment: {
                    inner: 'jORWdUta04bYg75Fb4yV0meiO+XlH5AitF2AZ+g2BQU=',
                  },
                  wrappedMemoKey:
                    'f7q2mb0bL1bSKX9b6YZ77Y58+tQ07r3Id80RM5WzryWTnt2t5obqCOcLonXLO3bg',
                  ovkWrappedKey: 'PWegX3A+huNHMqX/J0pthNP/2C02BMyDZrqBzH3sGxI6SU0eT7+sM9lDV43DefSo',
                },
                proof: {
                  inner:
                    'rO1LrPqAha58cQtoL7UTtl23cju65ae7vFlwJre1ZjUq35Vp2pLQcAO9T9ujzSoBdvViLmyFzeh0+B7/MFwCmJ+zyIEjAYpOwBwu92UNAfUdawv+ScSY6XE+vgLAXCgAGzEjV5sSD0byaj65J85piBAUCwbvRkpHFlmKVxfe6qATcedSs7MZXhDdrW6HgrqAIYiHJn5gTYfUjOwnpNBaQkOIm11SoHrohjdMLhihv7/O2F7SNkYltw62A6Qc7TKB',
                },
              },
              note: {
                value: {
                  knownAssetId: {
                    amount: {
                      lo: '23000000',
                    },
                    metadata: {
                      denomUnits: [
                        {
                          denom: 'penumbra',
                          exponent: 6,
                        },
                        {
                          denom: 'mpenumbra',
                          exponent: 3,
                        },
                        {
                          denom: 'upenumbra',
                        },
                      ],
                      base: 'upenumbra',
                      display: 'penumbra',
                      penumbraAssetId: {
                        inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
                      },
                    },
                  },
                },
                rseed: '8VsxgKtFLEMqsjq6MYIJUrJ0dC09mUlcvMx/K1zv60M=',
                address: {
                  decoded: {
                    address: {
                      inner:
                        'Y+RJoOIOZZGkGqIM2eCrYhhKz5jpWK+4kPRpsuc8MTC8s75ce9e3qhS68FTQAzHdQ4ZenpQAlrGNwTp/XiDKYfCpNNUiDtE0hYlL+9BGhSE=',
                    },
                    index: {
                      account: 1,
                    },
                    walletId: {
                      inner: 'Li7TyAOekHmcqUg7L22BoiYj8XPOkq7/dW/Nd71rkQA=',
                    },
                  },
                },
              },
              payloadKey: {
                inner: 'EhPKZrhV6ue9sIrW6NAfyNTKSDc7zOEtEk9BtZ8C6JE=',
              },
            },
          },
        },
        {
          spend: {
            visible: {
              spend: {
                body: {
                  balanceCommitment: {
                    inner: 'wuR6JewcTPhnBzmMUTNcGjcTUqDApPN/HXYQGw32IQI=',
                  },
                  nullifier: {
                    inner: 'HwxySpKV8nuDyQW0sHavb8k1hjBU6y35y7LfmYAbnQ4=',
                  },
                  rk: {
                    inner: 'LuDiuan9I6R3tJsQIHFuG128OojxsZ44s4PPcaARUgc=',
                  },
                },
                authSig: {
                  inner:
                    'Nk8XwaFeRYjatcWyk05CVi9gTTh0RckTtfp3RNHT3QdzwRr2GxXjiz1y6puTsph0aU68R+2Qdpcp7kpoV7TZAA==',
                },
                proof: {
                  inner:
                    'vhq7Hw4l3Ff5CmY88nqRfmH7Yn8U+Thg74a/H8fPdqvLpEyuzt8c5EZXznyRaaiAv0zk7CfCoE07gXm4SSJiVM9eJfyNGwi2HrBRENX0GQSGGAMs674Fbm6u0CJLIgkAB41KMakBiNE6ovlw1lHYIQXC4QyUV0sCTPHZv8YquG40L7PNRET5ipCsrYffFaqB8UTMkNJg/Kegz0k/mI4Nrz7T7OAF/1snTsQ+spDjTfUw6rckmS8VOASlLjputN+A',
                },
              },
              note: {
                value: {
                  knownAssetId: {
                    amount: {
                      lo: '100000000',
                    },
                    metadata: {
                      denomUnits: [
                        {
                          denom: 'penumbra',
                          exponent: 6,
                        },
                        {
                          denom: 'mpenumbra',
                          exponent: 3,
                        },
                        {
                          denom: 'upenumbra',
                        },
                      ],
                      base: 'upenumbra',
                      display: 'penumbra',
                      penumbraAssetId: {
                        inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
                      },
                    },
                  },
                },
                rseed: 'vUJtQfVxGbO94sx7XEl9KEhj45tLYG3bfkRthhJ1ANk=',
                address: {
                  decoded: {
                    address: {
                      inner:
                        'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
                    },
                    index: {},
                    walletId: {
                      inner: 'Li7TyAOekHmcqUg7L22BoiYj8XPOkq7/dW/Nd71rkQA=',
                    },
                  },
                },
              },
            },
          },
        },
        {
          spend: {
            visible: {
              spend: {
                body: {
                  balanceCommitment: {
                    inner: 'rqbOMGjlC6+bAOvEM62zZoFePVDuiziyCIZEeWYDAhA=',
                  },
                  nullifier: {
                    inner: 'E/bOScHoO2Lka4n89fHq4iJHFkeRuy1P+vcyVHN4PRE=',
                  },
                  rk: {
                    inner: 'LsLGKRp22uQkybzmiIXh+NM2n38JVvZvfxGYmK7lNwA=',
                  },
                },
                authSig: {
                  inner:
                    'KsJpO4aqv6mjjFWJX6g8KMDNMi2xf9nzri9l2bFT7QlCffCaAhr3DjNsiJdoAx4Y58k7tP9CUbj3yeX5RuTKAg==',
                },
                proof: {
                  inner:
                    'SsOCfPgz7Iyr4ZJ69xsr28VZbfGiYFSiuFlOKoPxWeMOnEeZqpFk+9/bmAf1UzOBGA03Byh4edilYDhwVNYQKh7VKgtWRQjQCs8KrVRyZ1lHI8jKc/NDrHcwaHpqfGIBsCXrbc3vyjeKlVhFkC9p7WGNEY0yUHIzdxMTBP9NJ4YauJ4Zk/dOIjY4NxTDk1GAx5KjCnZmn9Ux7B3Y/q7yArWb7QRiri6qEshPAFWhQOmqaYPzLuSbjsa0XByhHqEA',
                },
              },
              note: {
                value: {
                  knownAssetId: {
                    amount: {
                      lo: '1000000000000',
                    },
                    metadata: {
                      denomUnits: [
                        {
                          denom: 'penumbra',
                          exponent: 6,
                        },
                        {
                          denom: 'mpenumbra',
                          exponent: 3,
                        },
                        {
                          denom: 'upenumbra',
                        },
                      ],
                      base: 'upenumbra',
                      display: 'penumbra',
                      penumbraAssetId: {
                        inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
                      },
                    },
                  },
                },
                rseed: 'jCEQAuhjC0cHna9WRD8jM7TmuuJC8o40L4QXKs+vqk4=',
                address: {
                  decoded: {
                    address: {
                      inner:
                        'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
                    },
                    index: {},
                    walletId: {
                      inner: 'Li7TyAOekHmcqUg7L22BoiYj8XPOkq7/dW/Nd71rkQA=',
                    },
                  },
                },
              },
            },
          },
        },
        {
          output: {
            visible: {
              output: {
                body: {
                  notePayload: {
                    noteCommitment: {
                      inner: '3FTx6D+IH8RBr5VuJTak34oHtGk+cu/zMDK32Kb8wAQ=',
                    },
                    ephemeralKey: 'uk9Ctf0KcBRsErY5GpSBVjtFj+vlDom0ljSmwqaspQ8=',
                    encryptedNote: {
                      inner:
                        'PM7/bjyXmV6xaWnwEWxsULs4F06fxmkAjMI5H5TC1BExYQVecJvmcI9RtxRuwMJQdb4opX0y7H2JdypVPhKr3Rl3Ngjw+GdtAP/PBuhW2ftNj/RkY5qQKXB7GqRF19gvkbHaLGZp42Aw8zWF9ba7kU01uTbfh2dpJQZIVSAdSQnWBLcs2u747mK4zKwMaxlssCX0vvjL0dYrtaPjmSFySe8EVL7iLJg7zzoENA7pJzc=',
                    },
                  },
                  balanceCommitment: {
                    inner: 'BoQIdVlbLjgzjoMFFq9/DfH6749Rl+sDC6EhLJlGZRI=',
                  },
                  wrappedMemoKey:
                    'yLlXMEeghEa7HxQOh6MQGlzz8CruMZPuVA3ULj4qs9WK3OgsX7bftyPkYmjZ7Yft',
                  ovkWrappedKey: 'LX7h8SsJ/zJFGSc9Gc/rlCi3ZTHp3ABe9fvfpwitRvL8viZe80aModXq/ri3c3qE',
                },
                proof: {
                  inner:
                    'XHxrJbh21801r8tfC2Ryhe7wmxTfCa9S3WuXFdWYEkUlRvj4KD0t8xafnNUbfeyAGqb7D9vTf+6v3hmz+5TYPStcXJqbknyHGb7dFPrpNJeXn3IM+530BBg0BKCSbXsABbv5GEA1Lbnt6JX08r7qf6eupMGT7SqoYaURwcChnI5NDX6IaRL8QOXD7ofUeysBb+mD4e0jWt2Xr2ANl1EMrsgl7lCWkp5mnQ4M/DYS4i3P3s3JUoYG9h9nbfhE1CkA',
                },
              },
              note: {
                value: {
                  knownAssetId: {
                    amount: {
                      lo: '1000077000000',
                    },
                    metadata: {
                      denomUnits: [
                        {
                          denom: 'penumbra',
                          exponent: 6,
                        },
                        {
                          denom: 'mpenumbra',
                          exponent: 3,
                        },
                        {
                          denom: 'upenumbra',
                        },
                      ],
                      base: 'upenumbra',
                      display: 'penumbra',
                      penumbraAssetId: {
                        inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
                      },
                    },
                  },
                },
                rseed: '8OkcUTASRP36F7EBEuaPEsYyhv3c9Z3q/1botqcxOaQ=',
                address: {
                  decoded: {
                    address: {
                      inner:
                        'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
                    },
                    index: {},
                    walletId: {
                      inner: 'Li7TyAOekHmcqUg7L22BoiYj8XPOkq7/dW/Nd71rkQA=',
                    },
                  },
                },
              },
              payloadKey: {
                inner: 'EhPKZrhV6ue9sIrW6NAfyNTKSDc7zOEtEk9BtZ8C6JE=',
              },
            },
          },
        },
      ],
      transactionParameters: {
        chainId: 'penumbra-testnet-deimos',
        fee: {
          amount: {},
        },
      },
      detectionData: {
        fmdClues: [
          {
            inner:
              '4sbjmNOe3fKz96wEUJR3r6opa4MSwFFeZAgjG1UZNRJcn/LpOc+ZKMj1ZozM/E6Q8agIZRKrY94NCjoU5vfVAgAAAAA=',
          },
          {
            inner:
              'JBC0c08hfc6BoI2DPpxkrw7L+s+s3XCPpM842sLCOA262Af3+6kW5RTsnRWIQ+h2IcqGUJWrNPkZzibglM02BAAAAAA=',
          },
        ],
      },
      memoView: {
        visible: {
          ciphertext: {
            inner:
              'Ne9LOPmWu+oeMWtF2bCd2fgKu8UTeJyi4f2dqmsUSe78Jigz4sBELgFQwyO/9byAG2b2crdsXwyUrLS8/D3z5YXkizaFNFDJ180Bc3F3p+7wS1wi6cRzM18tJCtD9eCSZtIPru/B5fbP0NFt7X/UHVf5IWPpzM4TwlF6E1S8phcSOQIvybc+nLKfVVuyo+gcnPGGx3SJAoK3NozxrA7tcLlMbKB0X9I2kHg2qv9sdvYASCLOEk9z2ylAQLvPKrwTnUzv+WDsuIi48+llhYp/RCQS0dYryrIzTKf5s6OPNjteImDKI6Ze7csuNAtWQg/FtcQrm6Nfpvg1AYHjk/cbaJdLnXDwg/IJL5dlxlxX6Wr+6JFpLrE/Xi7mfg6F6qwcHAFj3uKEKNzFiWb9Yv0NklSCq7G5kculVYD8xgwHjorI+ldpI4KxHcBDTjpnTzKEgVg98OofskYOp6UqxKJioo7BMTAmb8RqfobzVrqbZypLhaDcyvZtWE9MFw13sopV4WkRtNhsZdTmOfsa2SrOHjAywFdyrdDrLSy8byBY2WtWfJWM5YreSrAR4QPF9PLHslM0WKuvR2naldVVqy/Qkzk1kyF+6lk+hwfrFxE8oGuFf4hoa/mIT9BLkejR/bmQl+aulziKClKzKOLqIcRwhRFa1rcTd2WAn+wWmaV3i7HNevrHqxQJ+Th8/qZObM9L',
          },
          plaintext: {
            returnAddress: {
              decoded: {
                address: {
                  inner:
                    'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
                },
                index: {},
                walletId: {
                  inner: 'Li7TyAOekHmcqUg7L22BoiYj8XPOkq7/dW/Nd71rkQA=',
                },
              },
            },
          },
        },
      },
    },
    bindingSig: {
      inner:
        'opEm2HzD29Kie5TkVmEpxHa/wpF4I0mW5CfLCz+GOwI2cHe46BPyWjz8COZekiCc1VECYEeQXe1a/leNyRixAA==',
    },
    anchor: {
      inner: 'pO/o5BB9FaNnk69lszgtX+DeJtw3jNjXXC81XERcUQY=',
    },
  },
});
