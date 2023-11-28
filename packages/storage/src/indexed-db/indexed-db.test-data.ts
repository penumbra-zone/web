import { base64ToUint8Array, ScanResult } from '@penumbra-zone/types';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import {
  SpendableNoteRecord,
  SwapRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

export const emptyScanResult: ScanResult = {
  height: 1092n,
  newNotes: [],
  newSwaps: [],
  sctUpdates: {
    delete_ranges: [],
    store_commitments: [],
    store_hashes: [],
  },
};

export const scanResultWithSctUpdates: ScanResult = {
  height: 1092n,
  newNotes: [],
  newSwaps: [],
  sctUpdates: {
    delete_ranges: [],
    store_commitments: [
      {
        commitment: { inner: 'qs3wdffdg34sfv' },
        position: { block: 2, commitment: 11, epoch: 1 },
      },
    ],
    store_hashes: [
      {
        essential: false,
        hash: new Uint8Array([33, 12, 33, 22, 98]),
        height: 1090,
        position: {
          block: 3,
          commitment: 12,
          epoch: 1,
        },
      },
    ],
    set_forgotten: 12n,
    set_position: { Position: { block: 2, commitment: 10, epoch: 1 } },
  },
};

export const scanResultWithNewSwaps: ScanResult = {
  height: 1092n,
  newNotes: [],
  newSwaps: [
    SwapRecord.fromJson({
      swapCommitment: { inner: 'A6VBVkrk+s18q+Sjhl8uEGfS3i0dwF1FrkNm8Db6VAA=' },
      swap: {
        tradingPair: {
          asset1: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
          asset2: { inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=' },
        },
        delta1I: {},
        delta2I: { lo: '1000000' },
        claimFee: { amount: {} },
        claimAddress: {
          inner:
            '2VQ9nQKqga8RylgOq+wAY3/Hmxg96mGnI+Te/BRnXWpr5bSxpLShbpOmzO4pPULf+tGjaBum6InyEpipJ+8wk+HufrvSBa43H9o2ir5WPbk=',
        },
        rseed: 'RPuhZ9q2F3XHbTcDPRTHnJjJaMxv8hes4TzJuMbsA/k=',
      },
      position: '2383742304257',
      nullifier: { inner: 'dE7LbhBDgDXHiRvreFyCllcKOOQeuIVsbn2aw8uKhww=' },
      outputData: {
        delta1: {},
        delta2: { lo: '1000000' },
        lambda1: { lo: '2665239' },
        lambda2: {},
        unfilled1: {},
        unfilled2: {},
        height: '356591',
        tradingPair: {
          asset1: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
          asset2: { inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=' },
        },
        epochStartingHeight: '356050',
      },
      source: { inner: '9e1OaxysQAzHUUKsroXMNRCzlPxd6hBWLrqURgNBrmE=' },
    }),
  ],
  sctUpdates: {
    delete_ranges: [],
    store_commitments: [
      {
        commitment: { inner: 'qs3wdffdg34sfv' },
        position: { block: 2, commitment: 11, epoch: 1 },
      },
    ],
    store_hashes: [
      {
        essential: false,
        hash: new Uint8Array([33, 12, 33, 22, 98]),
        height: 1090,
        position: {
          block: 3,
          commitment: 12,
          epoch: 1,
        },
      },
    ],
    set_forgotten: 12n,
    set_position: { Position: { block: 2, commitment: 10, epoch: 1 } },
  },
};

export const denomMetadataA = new DenomMetadata({
  symbol: 'usdc',
  penumbraAssetId: new AssetId({ altBaseDenom: 'usdc', inner: base64ToUint8Array('dXNkYw==') }),
});

export const denomMetadataB = new DenomMetadata({
  symbol: 'dai',
  penumbraAssetId: new AssetId({ altBaseDenom: 'dai', inner: base64ToUint8Array('ZGFp') }),
});

export const denomMetadataC = DenomMetadata.fromJson({
  denom_units: [
    {
      aliases: [],
      denom: 'gn',
      exponent: 6,
    },
    {
      aliases: [],
      denom: 'mgn',
      exponent: 3,
    },
    {
      aliases: [],
      denom: 'ugn',
      exponent: 0,
    },
  ],
  description: '',
  base: 'ugn',
  display: 'gn',
  name: '',
  symbol: '',
  uri: '',
  uri_hash: '',
  penumbra_asset_id: {
    inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=',
    alt_bech32m: '',
    alt_base_denom: '',
  },
});

export const newNote = SpendableNoteRecord.fromJson({
  noteCommitment: {
    inner: 'pXS1k2kvlph+vuk9uhqeoP1mZRc+f526a06/bg3EBwQ=',
  },
  note: {
    value: {
      amount: {
        lo: '12000000',
      },
      assetId: {
        inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
      },
    },
    rseed: 'h04XyitXpY1Q77M+vSzPauf4ZPx9NNRBAuUcVqP6pWo=',
    address: {
      inner:
        '874bHlYDfy3mT57v2bXQWm3SJ7g8LI3cZFKob8J8CfrP2aqVGo6ESrpGScI4t/B2/KgkjhzmAasx8GM1ejNz0J153vD8MBVM9FUZFACzSCg=',
    },
  },
  addressIndex: {
    account: 12,
    randomizer: 'AAAAAAAAAAAAAAAA',
  },
  nullifier: {
    inner: 'fv/wPZDA5L96Woc+Ry2s7u9IrwNxTFjSDYInZj3lRA8=',
  },
  heightCreated: '7197',
  position: '42986962944',
  source: {
    inner: '3CBS08dM9eLHH45Z9loZciZ9RaG9x1fc26Qnv0lQlto=',
  },
});

export const transactionInfo = TransactionInfo.fromJson({
  height: '137540',
  id: {
    hash: '9MI8IG5D3MQj3s1j0MXTwCQtAaVbwTlPkW8Qdz1EVIo=',
  },
  transaction: {
    body: {
      actions: [
        {
          spend: {
            body: {
              balanceCommitment: {
                inner: 'mLSHGBzim3wSsFOn431tR9fsD+RcPXK1hn7FtxYOlws=',
              },
              nullifier: 'knpvZH3soGxnNVQZcvlA+VMuvCZWVCgknts1mowDSgg=',
              rk: 'cmAa4EqbtHC5lhoVU6PGJfJl06QpBga4eO3cuF/8MAU=',
            },
            authSig: {
              inner:
                'GJo9VlwKrGKwwbRW6rTfZk6pIWYL0UEct3NTCFx7YhEnzeNg1l5zx9hfnxJysEBSU63OmG3NsLp+GABIsboTAA==',
            },
            proof: {
              inner:
                'OvLGAV9gAH3n5r/MV+nRkLMATFHpM6zubwdP6J1aJbBj7Ir1wteZg7OiXE3F4HkBg2dMaVLUUkTnLe1zyu9fIvLR5eMKLgCNI6MUfHZm0ax14fmMInQxv5JCijZe4WIBGpSxDFyGBAFaMoYOtbspGyeby7skgy9rAX7OMGrLGhrFp7YlevcgByRxbyEBqVABlptYxE/RLVP64ovO8pkSx7bJiK3NSfdC7RsxqqzaS+yGYK7biB24tGn1BG8z1EUA',
            },
          },
        },
        {
          spend: {
            body: {
              balanceCommitment: {
                inner: 'LnUs6kKZ+9MO+J+bHiDFm+WRnHEWgIjkw7ieivpQ7xE=',
              },
              nullifier: 'iKtEKV32USvsFJINbWs8WlpGrf4ISt+D61LkVzAyPwY=',
              rk: 'oIpHfSwEialuU436KIw9tXR3wWpgk0NHIcc17dRnYQM=',
            },
            authSig: {
              inner:
                '5vBg2TjWbJuG6XYG+D8vky7wrXv+2spahENVpQRFWQmVwhHEhdbKSa94LswbMsiuVC0UipX11ezgCWXpuDq6AA==',
            },
            proof: {
              inner:
                'bJixhv1Lr5D0uMeieXID9ESaFEKxv3pDb8Hppovl0kWc1fWtnESWhOXBmh7l+8EAehSUrZiEcNLJahtXP05xPy4qdBVfPPOYsFMiTTXyCsdgg/I+/21rBP99LBJAJU8A+WgWvu6TL84YRepUPOC56KsOnaP6hSEajt8liL3lTHeYYerbzGfzsESwjyPKuJEB+UJjTH419Mq5fXd5swY+3sqXB4/hDq/wVk9SuPGkDXvNUUZH6T1WqXSOXeaJOiGB',
            },
          },
        },
        {
          spend: {
            body: {
              balanceCommitment: {
                inner: 'yI14CUmNVu+N5+0/rgQdAMU5RBikcCQQzWaWHStfSAs=',
              },
              nullifier: 'B3XzzNvAuT3hMVqTfAAN6m9UlODZ9fldv3OyA55ABAs=',
              rk: 'vhkNUmggYaQRaIb1f0tT1RWapAcvF+i4NmuJPNi/iwo=',
            },
            authSig: {
              inner:
                'MhWvmocns1opnTDOuPT6NL6dSL7aeZEZV6I2A+ayJwqeRVK3kaFtOqo4vxnummdw/ydsPiAvVQnCHtnUXCmpAA==',
            },
            proof: {
              inner:
                '20w8HjUS/fthqz7vYcwvKyAbmONpCAm5QMYyMF+39EcHwGIanxNesVjoxKg/WTQBj/vO2fae6cR8bPZM+FzGzClDJx0Zn6zn6rKSPV6DAxxoK/ZvP/l7oNO9zVz56RgBEmfpuUwYEdc3jzQ2ND887zw/2lxTXYc1n+NWxBrm8SA9p5gENkfTEDkKK4iEF/EAMXz5kWx3jQ5OsxPj5XMFJ279P3LrR9a1jFx1ChMv9lROcpqGsLvuyQkXWsEvMFUB',
            },
          },
        },
        {
          spend: {
            body: {
              balanceCommitment: {
                inner: 'drR8MmEnfMs0CkY9QRaxiAGSZmM9lpU4+metaRt3UxA=',
              },
              nullifier: 'x40Dz0PFP84vJ3cswSdiKFJJCWuLtYxapRXSey/+wgQ=',
              rk: 'pujbFovCIVxlF5hCJ/+PlvBeCG0jHelV7im2Li+uTQI=',
            },
            authSig: {
              inner:
                'BrZoeKQXBpQD+E6EJ2OxzvEhW5RVZYGE5euvDeRNKwerXNmEuGpxFD8XsFqaA98kooJnHc35uP+ARYB9YOnDAw==',
            },
            proof: {
              inner:
                'PtvZI64TyNA0j2aHy31mz7sTOPkXVvGJJHImPfecYTag4K8ahmeCGjXx/5wTjWaBsiAnuVJD63mFlKr8MhmK9rp7llprkM8ehRGA0S9tB/IHJ0da46YDzH8XGyG4UHcBuoK03fuq+4V84TAOzAs5+Ca/NSnV1Z0C7HTqd1M86tdo2mC1Gs5Ys/EM+ItleHoACY+cqDrWZVbiuONHAq7HE9/gKx9kiTCDCFDK05kawUBK1scKQG5jiybFebVkik2A',
            },
          },
        },
        {
          output: {
            body: {
              notePayload: {
                noteCommitment: {
                  inner: '3WvedSSpq4kX951dVMMMeKR2OepBTPqGpF8QOO//fgw=',
                },
                ephemeralKey: '+kGNLsbePwgL6LuINJqnV4l/y2AwbBDI224/1nq5xgk=',
                encryptedNote: {
                  inner:
                    'R/Gf/zakltAbRg0shbrd85bP4phrFZ4Msuw+gUjD3qGgsChIVIrLpSSOTtMlJpKCGhAmxDn3oCvdk5ASU3HkPVLaL90RniZ2ZJ1nGgij0pA2XbVcdotRdRfw6ZHxB0SAB2EWSv9oV/K7vNAtR+SpNAMG6bbQsLjqVJCbZMmSVhhnojoQV6/KeYEfa/R8T7LUBwEBR4MY3qO4SxLfPIQQulxo6qoYm462wUF1njA1pIE=',
                },
              },
              balanceCommitment: {
                inner: 'mBZDCVkBXzFEdebcHD1QPqn5xuAIpoF+SMa4IRxvZww=',
              },
              wrappedMemoKey: 'tfvqFYlHGJ7x0R1ch7sThXGPGLL/jYSK9My1ngipfdLtIjbOQRZoO/oty0jGXYjZ',
              ovkWrappedKey: 'v40iQUFriHfiy8sSjfuQlc7P7fU6VfknPgMEGiC1cJxRHRRCBknbxlCG+99GKZAG',
            },
            proof: {
              inner:
                '7mya0y4ZcnHrtHA9xuMmtf+6V1jfpA8GNrtQoxPaDnAuMN9Qe2h6K9MtoDTOpC0AVN5DZVt7zITsVZLPMZ70sQ+XlS2fivUNIk6/20Twkev4xc809nebdr3AqSoNoIIAor1ZbGQNIdqaNItvp3DQ4S0FguaGcS1TBwebiJTeUwfL4TH9D6QL6YvkGp1JSg0Bv0q7psIptEdI5WtSZZjR8kY11QXlPr0bwDiyc15CFIhlHGAj3RqhlH0fsNmEGZUB',
            },
          },
        },
        {
          output: {
            body: {
              notePayload: {
                noteCommitment: {
                  inner: '5LGElYM7UCex9oVWgBfgfo1iQkTSm5Z1DZAPFUW+NQo=',
                },
                ephemeralKey: '0g8xqLhvfT+h/dfX90f7xF7Jyyv4tCXzLCBKXhUyKRI=',
                encryptedNote: {
                  inner:
                    'p4051rDIv7tVLIqGk7cagA6O+Km2Byo0yscU1DFCgJkkdQnkEFabmJS601rLQ7tsyh/+FPEnb0dSIi00S1rmLCya2tRlRS4ru6WtBjchw6vn9To/S5qbGVMD6l3siIxJo9RVrAaNFE35ForqpZpCXqPctiHKC30dSMHG0+O9MPKzRqlwCJKDOezUR1rrPZV+ukvB1KU6QUpHnZtQFLQnMW7cZmOzp5SraYksZqhoTy4=',
                },
              },
              balanceCommitment: {
                inner: 'jttI7PeS8mE1wp+COaVNuu7HOBFkrTCWThyZLrobvww=',
              },
              wrappedMemoKey: 'nyv6CdQkZqOMTGP0mBAv3ec01+g4v4HCmUKuup7cG+Dz6M5Jb1welFOmicaImiM+',
              ovkWrappedKey: 'i9FMZLMduuTBQQ2t3QXSXAgf4aWHA1eTJAsGEKcoQPDXReWdVNC1/V2OXhiXLxcp',
            },
            proof: {
              inner:
                'fW2/mxyDh+X5bxGeOzSp/OoGyqDkd2///6wzQZaIEZRyHSpG1+/8ZGZ8EI0YU7KAPjzCqPd7Nkb+nTHp/KWFV3Uu4IxNs4mbAKIyeYII2NybTphQdC3MzRZg+oTkH2IABdqP4X2hdBZ28zntxXSdicA3lq+fQfD6KxfrJpA80d9BLTqJsrFI0dRwCSF6LLOAgXpvlsM16IYtb0ykQ9q5cBmvsXdvPliAIAq5Pi40j05XX/tb+msZ6RLhdXnqkgMA',
            },
          },
        },
        {
          output: {
            body: {
              notePayload: {
                noteCommitment: {
                  inner: 'GuHzSMZYeSJvb07AgErw50TH13xxE5SMD7fPmH8N+gA=',
                },
                ephemeralKey: 'ZAQfdUWQRWFSaCGVeThQtiWQWE2BXPqr+45L+3Rqlw0=',
                encryptedNote: {
                  inner:
                    '96BGfrpJL3ir7pO4GW6YKZjlqR/qf5Fa+qxFpqH+rRJg7JDXL525HpZy8VoQWLsXaTsnGVERwyPoGZG291LAY5rUZDGMIs8v5Pyfn4mLnTPzeH6abr/cOvVTmJ4h4642z7KhdGyo5IbXdGyCkbgWydTePv0KmD9M8s4UW/F15rpds+gQIGz2AE4+12+4jPr++oangCNLf4pEmwiKjBlx0IihrNxk1/6kTRuAfL4VI8g=',
                },
              },
              balanceCommitment: {
                inner: 'IvBWZSjXNrtEFuLlbawHFN61dglil7l55i+GwG8PbgY=',
              },
              wrappedMemoKey: 'U3llcLx+1omlkP+/C1QQAMDoyuRaAcBwDjIQjtDQL6F1q4JF9PRTvrYikhdtOJZJ',
              ovkWrappedKey: 'CFRgB/mTvu+MpaoLzJ7iEqs3ndKsMNA9eGE3rPJLcIWRbCWpv7YMx9szPzTmZAQ1',
            },
            proof: {
              inner:
                'CzpdU4xERq3c+XtOPYvEZkvvQZOBK7uLoBoBqJGeDnzDonmaOXh4KR93f3VzMniA3KEeT46K+KxDTQ54pKQU8gk7OeYtQzbTLEiMTIIcmNLnZ2Ec2//zLOi0d7M/TXgBi3H4g6rLqbRcU7W7cxHyYvbNOBmM6Oi+SMMuLAKpRzBT8ygmIvMDnwxa1o5zeG0B1TWh2HLQFzGVUgT4517B+6nOj4/gJy7lofIiOvr8pAZsz2InVDNoxwf13DttoxcA',
            },
          },
        },
        {
          output: {
            body: {
              notePayload: {
                noteCommitment: {
                  inner: 'VZvk7tv1zn/hSti2nLpL6x7gAHzJUbdkIy5LDR70kBE=',
                },
                ephemeralKey: 'HnWYIW5yBrSjxzgGf3fNLY3C3RkwrX6XuW7/RO8qqhE=',
                encryptedNote: {
                  inner:
                    'N4VY6GxAOfDo/CtV3TggMTnS9qdp8ixYkJktrrw3YtmsQusyVd8BQPggnbpC3XyhOabe0phE5+BFr07EwCDH71bGO/7FglAPV3zCA2G1rKLGge5GeRz7mlorDvueAx/T9286Vx8DN2dRBfgLEGw5YmLjsUISVH9hAPk4KzjBgAQqBeNxATv7PROUhjnp8fO8DrEe9fL7lWnjhtTd7Id1s23aIshpTIEOQG21CgOQxdY=',
                },
              },
              balanceCommitment: {
                inner: 'dOxUDjSlcIAL+W5YtUKpodErvfz7S53YlR6uke1iWwk=',
              },
              wrappedMemoKey: 'DJUfS5jfFyoBb6E4H/ATFpG5CjcPJPC9RmuzKrDIzVG+it+/Y7KBpN2ABGrJL5WC',
              ovkWrappedKey: 'l6YPHV8bxB1oPbAcBLtDAc1Aq20kD5U4+oZRpYj59bviXUzfCIvnITfuanhJtrOG',
            },
            proof: {
              inner:
                'xxwfTg9Reb/WGu4wmUkWUarpLeU2vRXAE8Btc6QHExK398wytGzxlsyNY2S7qXoBJHFVcRv6Tx3oC6dZ5fAoGpzJI7uEN70i/eJOSZbHLTA6XY0VOrkA2P3zIbgLZu8A6cyW3hl7uMBphf6bqLyxsGFUZu7noSHUb4AnW5Wfod2giwsIm9/kzjpBDf3iQ9kASJBJTffLAvszNUVrR3mrJC0wEdqPTtoz84Iyy7VUzkcAJmi/P+AIJJIRtdnp7IqB',
            },
          },
        },
        {
          output: {
            body: {
              notePayload: {
                noteCommitment: {
                  inner: 'v00WG4eq2UfFceMbEePaWakxAEuyXkNpiR/RhUIP3gw=',
                },
                ephemeralKey: 'IN7b2urD0lenpjQHDqfcc3d8XXCgsKpASqyJDoPZzws=',
                encryptedNote: {
                  inner:
                    'me0HxTd9Ca5SRXOPTCC9zbJ4fi75eYgjNIDA/7Uf6jcntYij6lMg5OoUBr1MKNYG44mJWxUBNmaG0iZ1k/P+KNVc9aCqCAdZJBT/72Cw9KCOa4Z3dYhmwW9JVwFEVN4taeNi81xi+nLd/0BzrKAMJCCLkH5z7tUztCXvZGcK26AGsqUa5M3JadsmwtAmAa0mhtP8Nvj1GCxtfnyxFiOTw6iF4xnRxcT97LkrF43jPPM=',
                },
              },
              balanceCommitment: {
                inner: 'xhEvO8D8VosI/rXowFT18XKphHx2KE/flhsueexl4hE=',
              },
              wrappedMemoKey: 'aqV0AB1qGm+H7MANkV7GOf+gy9yol9Zeq1KJCiwv2P+JxrCneSMnNYod3eAToWGn',
              ovkWrappedKey: '86CR823j7a/R8PTy9KmlXBPoRVDtqmjuuSWgSRa9Lv5lxHuS0N5aSDQ7udlhgx9M',
            },
            proof: {
              inner:
                'l8neFhNDPbJ1AqemLyIdMbwAtUBrs60ea36j9upZKo7gtTsryYDYhCimNLlt2SgAQDrAAW+t6Do4DDv14x9GLFifBiw2bnbbtf97JUDGKZJ8T8H5RQdpfOCEIiC5lAUB82DDjN8LeAjkfUHybqBytvsNCRuULznIbKTT8LJm8OJXsbH60/F/lkuI38KyI78AWjZks2sdX141IT51czpMGNs1NepX/d739+dcdsmoQSMU8OSrVNns4eZNvknS+3SA',
            },
          },
        },
        {
          output: {
            body: {
              notePayload: {
                noteCommitment: {
                  inner: 'WinDFqc8CqAxkr/NOQHNtSO+6Ro7u/lGD6slOYR1lg0=',
                },
                ephemeralKey: 'pBtwFCcA/FC22GzngcQrvWk/+2++b+2uo3QahfjkMgQ=',
                encryptedNote: {
                  inner:
                    '6Gqpf/x3cd1g1hQ1U2b4nNok5SpYuEwwWg5nUtDHYS9CZz35+dg9XbqDUtFP74mVjYbxVB4+qXr2F2HiT8WrX0artkKS4/iWNxe4KlxnG1g/cLcTreZ1S36OH7rVXzcMQWFEgYH8HCKkTvIuMNnQr6E+uTUaX1qIj0gpKCMMfqzFtFAPQVKlHTNkHB+2gY9c6MOa3r/HfGehDgnk5t7S+hYha/hYmcV193GYSIIalE0=',
                },
              },
              balanceCommitment: {
                inner: 'wsJeHMoAbyf/NTCUwX0kOLUxEOQF303v2WlFOkzkGAw=',
              },
              wrappedMemoKey: 'gMvMDEebtNu2MgbaSESx0X5NoIHgBjnd7EFVQF6wPorDV3Zxn8QrXHIUqfhQX7tB',
              ovkWrappedKey: '9z9jH7JMS+/0uOQ+wGbQnir+YUWZHXGOGtMG6O7GZYz7SCMCyMweiwk/Tu0ATnZv',
            },
            proof: {
              inner:
                'Q2Oberg+JGR2QrG+3lxCkcVko7XDlbQBPWe1DeytG7rdco7NVPZw7mGMDmqhfOGA+QMeo4xXV+vFmpP8e2qS5E5kJW3MVMs/QFhs8nptPNqm14aF27U9vsPVJpeio4MBlDVi+TAsjVk2zQ/lFw33l5Dla4fne1cMFrYPaG6WrwH5YQYZuaJzz5bUX+FGnlQBtfZl3YlGDYZHL0NijuM9jujzpjAh/p6ROIKNZahMXSxsSHp7iQsO0cwQFw4y87gA',
            },
          },
        },
        {
          output: {
            body: {
              notePayload: {
                noteCommitment: {
                  inner: 'mycDZGRmawM/gn5mcSLdekUcwayLwCBaPNdvVhL41Qk=',
                },
                ephemeralKey: 'MAraIMUu/UiY5oQeo6Jh6Tm3sS3a5uqqGXiGDKmc/AM=',
                encryptedNote: {
                  inner:
                    '3pJ7goLAX/kHPRPqzhPJ3fYMrS0PvKxESdfcvxWB7b8MPByC34G/HkMDqjx6/DO599ubAJM5LsFpGrnhGPtE0hg+GNu8W+d54oRd3qJ2Uh5LtvXfGK0zM0qBXSXKIkXBEOGODZJ6f2L+m9qX6roK1J59VodCIa1wEBVuPbXogcq/CYn3L0A3ot7Yj9MWYQnZ0QcW1s0g/NkaNonHnhz6UWsK1U3zaPRih10p/GoapXg=',
                },
              },
              balanceCommitment: {
                inner: 'PKW0VKrMuencxQGVVUq5Rjp0OQZvrpXHlanBwyVC1gU=',
              },
              wrappedMemoKey: 'gbYRvDj2DmvyqB0MrVqAydcOmCcFbmOF4wrFNaZtx/stz7n0CjEuUdH4LJV99LZ+',
              ovkWrappedKey: 'A/2JWy9UhF3xx7wXfhf8735w7HlzT5KBWT6V4yKJNw8xirQ7luzpGs+lyQkw7+Ke',
            },
            proof: {
              inner:
                'm+yVsZSP2w0SvlakWAyypRI8zZFZ000XwA3lf6UF8xDP/b7wZyHiyZof8dMy2TwBwodfNx2D9vxBax73RVBovUjceqGhYU5MqxFkjIlREH1U0rKgMqRVayzzStnzbdUA4Lf7ByeQAjm7DlyK03tfedaiXV4jkPyEoyI9m78A74O0qPzCdUExFoDUx3/XC2+Bog1NvDN5NFmP/XBOl3ZMJDH1rcBkskHipdGiSE92V+c9Mtdea3vWX7C+ebD5sSEA',
            },
          },
        },
        {
          output: {
            body: {
              notePayload: {
                noteCommitment: {
                  inner: '/mmvwP2dPRNkX4IJiq+7ZfXsubsoCY9gp2N/9ugHqRI=',
                },
                ephemeralKey: 'xhgPCiRjN6snO5qlsdRpA7oCUVRWxpE8n7/Z2uU60gw=',
                encryptedNote: {
                  inner:
                    'ayaHlEzPbu8QJwtLea/WxhucXytntgXhLFfrIf8YrHkuYewBDEIuMjyQJ1q6zHjXVt46QF0bcXDi5rfnFepdVyLiS0z3ZQAO73SGuPOJegiwgz0iPgngMpqE39S2m5VH8saFzRzywkTQpWsR//naWB5oqfS3/AVpNUwzm9Mnvme4LImyR3vWT4dbvsYVsmQgcXK/mYjb5KRtTyxzqe3PnLFTIRbGCKeRFEZ7My0QgG8=',
                },
              },
              balanceCommitment: {
                inner: 'aqUqgKx/4+12S6yk6hUCurgMTxiJ286AcfjVGPiORAM=',
              },
              wrappedMemoKey: 'hu4iFAe9hP7zBAOw5xaBWv2TSaLzhQ/1oJhkSp5Ug2M2pr/EZhJGSLOvix501AcM',
              ovkWrappedKey: 'uZYJSJUbd9R6LB5ii508XyxLJtIvWjZ6co88VTKEL/33lkMvhsIxTZyp+RZKS4cF',
            },
            proof: {
              inner:
                'TTjJyg3Wo8a5IYfhwCynxLuY25413eUpl17F6ZBw6tbBKzCBcPCESpcwhEZSmNGAjFM8v5H7Wh6qmDa/gG3AIJANB0ZDShaMO/tlaBBRc+vTmDU9xMvsnfZtAlMa2YoBuwmjkjFcu2bz0c08jjp6Tg3K9RkjPWA685UDZVnHjDzVet+lVeCeah1IDiYiBKQAAjpa2vXwC6kGCACV6I8HXSMx27faqX7mQMFVNve9p8isXbyQWqzJax+z24Kjh08A',
            },
          },
        },
      ],
      transactionParameters: {
        chainId: 'penumbra-testnet-rhea',
      },
      fee: {
        amount: {},
      },
      detectionData: {
        fmdClues: [
          {
            inner:
              'vCPE22JFgv8JPOWri+IknthYYx5bbUBwqrSnL2Ko2hGtDfh7NRI3lI8Co5Zei8+4jUcaJctQkGrYD0uXwI5SBAAAAAA=',
          },
          {
            inner:
              'FCuaszw2jXO9bjcKHtXBTNpK80fg4qF1RuV8o19kHgJCh0Gg+OfHjuds5Qpnp73oZBr4zOrxVojO3cCRNv5KAQAAAAA=',
          },
          {
            inner:
              'CnlKAo3MOrejUQJYobus9R0mx0s5B2N3RD9KHCy+1gZipbCHMWsxQtNI4Aq6mne0lEpjimOkJBoIfV7rd4dsAgAAAAA=',
          },
          {
            inner:
              'EtmIfw5uII1WoDURC9Fwt5XvWOUNSYmhz4IvdMZocwO9783PQd+DcfnjBkT2JRUj8ZWRlULSxmoUemdyrnWWAAAAAAA=',
          },
          {
            inner:
              'MHMLUbB/CJasfDn5SrNzU86/ADJ80vRlp14fp5BACg4+5TST+rgMVxWI4G65Z/TT3NEFU/od8WSCSwrBPFB1BAAAAAA=',
          },
          {
            inner:
              'TLjYWauiUprJeZvQm7pn7qhGgQqGpdUO8XY168bUFgbIaGZAucv8+Ih9oprdDJtwu+u6XMOthV0lxXcExWAJAAAAAAA=',
          },
          {
            inner:
              'rpz7S5DAzY+vBfnpx6v+XGeQGIAVQHJdfPDX0GM1FxHN++wjE99MUgQWj7PQ/xor8Bq78LXCyFV4sBqAe9rzAgAAAAA=',
          },
          {
            inner:
              'go/zUaQciHzEjoBJcwZw7hAr3nGoscaPxnRg5iiUYwTlE3kMXx6RfbQqkMrzSz+cVR0j8d9FzMk3+I+efM0EAwAAAAA=',
          },
        ],
      },
      memoData: {
        encryptedMemo:
          'NGJ0T7iaorVP2ApR/78bejqFVn87DO+2vcaogbZYf5VvL6HvazSfYGiLq52c24n4ZfYGtN1z8dTyVknbJ9JawwComzYZ7kkWlQyUbXuKIGCowgxuv0dZ+5QXPuL7acycgnVXlzkfPH6CJylHKhWPb1Wskdk5KJaM+I2ofKi69LPtkIQhYcy3Prc7/nAwytxdjcWjsvS3bjRfry+F4ch8n+2EcUklygz2wnAr21crV6Hd855q+/OZKyEpWkODTB4wuYetm4b8laFklWKWDhFzezdmIUXgf/RSVIgk51H5hThVauH8m1dg4kW/5wklVCrzJjrem2/T/KnIIJEcxzuQ85Smk86fWycgnraQ80Sy9G1nU8rqwBE4KUFLQ6OVu5z0pfYH3DaYKTpVmOsvwCz2l2+me9U6JIB5jiQRvdcjjmPquDIhPbOSNlKRmLa6tmvEqM0Y7rxT1MnbR3Cdzp+30gwruLg0oiTm80N1Ltdkwv2+0uR8iSAfSVmW9o05/Lnqt548hGS/bW3LDX7BHV/Jq464prPUOejEqiFPHjohHlC3hs4T3k8if9euY5DIBwk5evwQ+rNE2E/x8g/wjJyWLp+Nslms8E66ecHWUNgQb5i6NiLwZ8f15/kdrG+ioZj1d/S0hTC9JgZCTEmcvfNBKxOw7ge93cxRmv7Sj688QA5acUDAejinEZmvXXyRV2AD',
      },
    },
    bindingSig:
      'VDwfYSlhod90QLBvTdIM+T+WdscTjqecFp4PSeRhhwQX2Al3CHo0Bikx3hix0iO4zF/EnRIuz4J70clixI9VAg==',
    anchor: {
      inner: 'mrchwun83TOMYsdXtkBSdUYXXMzlg6N2NYfEcqWmfwE=',
    },
  },
  perspective: {
    payloadKeys: [
      {
        payloadKey: {
          inner: 'LkK6Gl5mZtP0CvHMXTO69uM5WHk0NEAtki7JdKyi05o=',
        },
        commitment: {
          inner: 'GuHzSMZYeSJvb07AgErw50TH13xxE5SMD7fPmH8N+gA=',
        },
      },
      {
        payloadKey: {
          inner: 'EXVVIK9A91AjpBlQbHThrYc5Na8gDjrvrmJLttu1FeQ=',
        },
        commitment: {
          inner: 'mycDZGRmawM/gn5mcSLdekUcwayLwCBaPNdvVhL41Qk=',
        },
      },
      {
        payloadKey: {
          inner: '/HNmyUazwmnS+2wmTqefgcWM87WhCC+rUNYAQm4UXko=',
        },
        commitment: {
          inner: '5LGElYM7UCex9oVWgBfgfo1iQkTSm5Z1DZAPFUW+NQo=',
        },
      },
      {
        payloadKey: {
          inner: '4r502d2ihU6Zlgty8lb8AabHNjxV8R3YzU0nYfOJiEM=',
        },
        commitment: {
          inner: '3WvedSSpq4kX951dVMMMeKR2OepBTPqGpF8QOO//fgw=',
        },
      },
      {
        payloadKey: {
          inner: 'v28T25y3b8BRLMFGbzscjDKV1tqA7hWwM8+Rf604wdk=',
        },
        commitment: {
          inner: 'v00WG4eq2UfFceMbEePaWakxAEuyXkNpiR/RhUIP3gw=',
        },
      },
      {
        payloadKey: {
          inner: 'p7I+KPE6/+XzTlGzrs3fNuMwBfb3szWA+Z8ouG72aVQ=',
        },
        commitment: {
          inner: 'WinDFqc8CqAxkr/NOQHNtSO+6Ro7u/lGD6slOYR1lg0=',
        },
      },
      {
        payloadKey: {
          inner: '+ZUM4sMWPOmUbOkzL+84p+TxPq1NkfayaKPgPYm0jQY=',
        },
        commitment: {
          inner: 'VZvk7tv1zn/hSti2nLpL6x7gAHzJUbdkIy5LDR70kBE=',
        },
      },
      {
        payloadKey: {
          inner: 'rPbmE7sTAcMBy1F6rlc+c4uMZVj7uJO/qt5x+rxhYAc=',
        },
        commitment: {
          inner: '/mmvwP2dPRNkX4IJiq+7ZfXsubsoCY9gp2N/9ugHqRI=',
        },
      },
    ],
    addressViews: [
      {
        visible: {
          address: {
            inner:
              '2VQ9nQKqga8RylgOq+wAY3/Hmxg96mGnI+Te/BRnXWpr5bSxpLShbpOmzO4pPULf+tGjaBum6InyEpipJ+8wk+HufrvSBa43H9o2ir5WPbk=',
          },
          index: {
            randomizer: 'AAAAAAAAAAAAAAAA',
          },
          walletId: {
            inner: 'fL+mQMrLORkNyDZjWyv2zcCwef7rT93t9+/VVFxXJgw=',
          },
        },
      },
    ],
    denoms: [
      {
        denomUnits: [
          {
            denom: 'gm',
            exponent: 6,
          },
          {
            denom: 'mgm',
            exponent: 3,
          },
          {
            denom: 'ugm',
          },
        ],
        base: 'ugm',
        display: 'gm',
        penumbraAssetId: {
          inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=',
        },
      },
      {
        denomUnits: [
          {
            denom: 'test_usd',
            exponent: 18,
          },
          {
            denom: 'wtest_usd',
          },
        ],
        base: 'wtest_usd',
        display: 'test_usd',
        penumbraAssetId: {
          inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
        },
      },
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
      {
        denomUnits: [
          {
            denom: 'gn',
            exponent: 6,
          },
          {
            denom: 'mgn',
            exponent: 3,
          },
          {
            denom: 'ugn',
          },
        ],
        base: 'ugn',
        display: 'gn',
        penumbraAssetId: {
          inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=',
        },
      },
    ],
    transactionId: {
      hash: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    },
  },
  view: {
    bodyView: {
      actionViews: [
        {
          spend: {
            opaque: {
              spend: {
                body: {
                  balanceCommitment: {
                    inner: 'mLSHGBzim3wSsFOn431tR9fsD+RcPXK1hn7FtxYOlws=',
                  },
                  nullifier: 'knpvZH3soGxnNVQZcvlA+VMuvCZWVCgknts1mowDSgg=',
                  rk: 'cmAa4EqbtHC5lhoVU6PGJfJl06QpBga4eO3cuF/8MAU=',
                },
                authSig: {
                  inner:
                    'GJo9VlwKrGKwwbRW6rTfZk6pIWYL0UEct3NTCFx7YhEnzeNg1l5zx9hfnxJysEBSU63OmG3NsLp+GABIsboTAA==',
                },
                proof: {
                  inner:
                    'OvLGAV9gAH3n5r/MV+nRkLMATFHpM6zubwdP6J1aJbBj7Ir1wteZg7OiXE3F4HkBg2dMaVLUUkTnLe1zyu9fIvLR5eMKLgCNI6MUfHZm0ax14fmMInQxv5JCijZe4WIBGpSxDFyGBAFaMoYOtbspGyeby7skgy9rAX7OMGrLGhrFp7YlevcgByRxbyEBqVABlptYxE/RLVP64ovO8pkSx7bJiK3NSfdC7RsxqqzaS+yGYK7biB24tGn1BG8z1EUA',
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
                    inner: 'LnUs6kKZ+9MO+J+bHiDFm+WRnHEWgIjkw7ieivpQ7xE=',
                  },
                  nullifier: 'iKtEKV32USvsFJINbWs8WlpGrf4ISt+D61LkVzAyPwY=',
                  rk: 'oIpHfSwEialuU436KIw9tXR3wWpgk0NHIcc17dRnYQM=',
                },
                authSig: {
                  inner:
                    '5vBg2TjWbJuG6XYG+D8vky7wrXv+2spahENVpQRFWQmVwhHEhdbKSa94LswbMsiuVC0UipX11ezgCWXpuDq6AA==',
                },
                proof: {
                  inner:
                    'bJixhv1Lr5D0uMeieXID9ESaFEKxv3pDb8Hppovl0kWc1fWtnESWhOXBmh7l+8EAehSUrZiEcNLJahtXP05xPy4qdBVfPPOYsFMiTTXyCsdgg/I+/21rBP99LBJAJU8A+WgWvu6TL84YRepUPOC56KsOnaP6hSEajt8liL3lTHeYYerbzGfzsESwjyPKuJEB+UJjTH419Mq5fXd5swY+3sqXB4/hDq/wVk9SuPGkDXvNUUZH6T1WqXSOXeaJOiGB',
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
                    inner: 'yI14CUmNVu+N5+0/rgQdAMU5RBikcCQQzWaWHStfSAs=',
                  },
                  nullifier: 'B3XzzNvAuT3hMVqTfAAN6m9UlODZ9fldv3OyA55ABAs=',
                  rk: 'vhkNUmggYaQRaIb1f0tT1RWapAcvF+i4NmuJPNi/iwo=',
                },
                authSig: {
                  inner:
                    'MhWvmocns1opnTDOuPT6NL6dSL7aeZEZV6I2A+ayJwqeRVK3kaFtOqo4vxnummdw/ydsPiAvVQnCHtnUXCmpAA==',
                },
                proof: {
                  inner:
                    '20w8HjUS/fthqz7vYcwvKyAbmONpCAm5QMYyMF+39EcHwGIanxNesVjoxKg/WTQBj/vO2fae6cR8bPZM+FzGzClDJx0Zn6zn6rKSPV6DAxxoK/ZvP/l7oNO9zVz56RgBEmfpuUwYEdc3jzQ2ND887zw/2lxTXYc1n+NWxBrm8SA9p5gENkfTEDkKK4iEF/EAMXz5kWx3jQ5OsxPj5XMFJ279P3LrR9a1jFx1ChMv9lROcpqGsLvuyQkXWsEvMFUB',
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
                    inner: 'drR8MmEnfMs0CkY9QRaxiAGSZmM9lpU4+metaRt3UxA=',
                  },
                  nullifier: 'x40Dz0PFP84vJ3cswSdiKFJJCWuLtYxapRXSey/+wgQ=',
                  rk: 'pujbFovCIVxlF5hCJ/+PlvBeCG0jHelV7im2Li+uTQI=',
                },
                authSig: {
                  inner:
                    'BrZoeKQXBpQD+E6EJ2OxzvEhW5RVZYGE5euvDeRNKwerXNmEuGpxFD8XsFqaA98kooJnHc35uP+ARYB9YOnDAw==',
                },
                proof: {
                  inner:
                    'PtvZI64TyNA0j2aHy31mz7sTOPkXVvGJJHImPfecYTag4K8ahmeCGjXx/5wTjWaBsiAnuVJD63mFlKr8MhmK9rp7llprkM8ehRGA0S9tB/IHJ0da46YDzH8XGyG4UHcBuoK03fuq+4V84TAOzAs5+Ca/NSnV1Z0C7HTqd1M86tdo2mC1Gs5Ys/EM+ItleHoACY+cqDrWZVbiuONHAq7HE9/gKx9kiTCDCFDK05kawUBK1scKQG5jiybFebVkik2A',
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
                      inner: '3WvedSSpq4kX951dVMMMeKR2OepBTPqGpF8QOO//fgw=',
                    },
                    ephemeralKey: '+kGNLsbePwgL6LuINJqnV4l/y2AwbBDI224/1nq5xgk=',
                    encryptedNote: {
                      inner:
                        'R/Gf/zakltAbRg0shbrd85bP4phrFZ4Msuw+gUjD3qGgsChIVIrLpSSOTtMlJpKCGhAmxDn3oCvdk5ASU3HkPVLaL90RniZ2ZJ1nGgij0pA2XbVcdotRdRfw6ZHxB0SAB2EWSv9oV/K7vNAtR+SpNAMG6bbQsLjqVJCbZMmSVhhnojoQV6/KeYEfa/R8T7LUBwEBR4MY3qO4SxLfPIQQulxo6qoYm462wUF1njA1pIE=',
                    },
                  },
                  balanceCommitment: {
                    inner: 'mBZDCVkBXzFEdebcHD1QPqn5xuAIpoF+SMa4IRxvZww=',
                  },
                  wrappedMemoKey:
                    'tfvqFYlHGJ7x0R1ch7sThXGPGLL/jYSK9My1ngipfdLtIjbOQRZoO/oty0jGXYjZ',
                  ovkWrappedKey: 'v40iQUFriHfiy8sSjfuQlc7P7fU6VfknPgMEGiC1cJxRHRRCBknbxlCG+99GKZAG',
                },
                proof: {
                  inner:
                    '7mya0y4ZcnHrtHA9xuMmtf+6V1jfpA8GNrtQoxPaDnAuMN9Qe2h6K9MtoDTOpC0AVN5DZVt7zITsVZLPMZ70sQ+XlS2fivUNIk6/20Twkev4xc809nebdr3AqSoNoIIAor1ZbGQNIdqaNItvp3DQ4S0FguaGcS1TBwebiJTeUwfL4TH9D6QL6YvkGp1JSg0Bv0q7psIptEdI5WtSZZjR8kY11QXlPr0bwDiyc15CFIhlHGAj3RqhlH0fsNmEGZUB',
                },
              },
              note: {
                value: {
                  knownDenom: {
                    amount: {
                      lo: '100000000',
                    },
                    denom: {
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
                rseed: 'g9BsBqL0ExL6WlJqzIcPcipOdBDn6cg7DyXF29k46tE=',
                address: {
                  visible: {
                    address: {
                      inner:
                        '2VQ9nQKqga8RylgOq+wAY3/Hmxg96mGnI+Te/BRnXWpr5bSxpLShbpOmzO4pPULf+tGjaBum6InyEpipJ+8wk+HufrvSBa43H9o2ir5WPbk=',
                    },
                    index: {
                      randomizer: 'AAAAAAAAAAAAAAAA',
                    },
                    walletId: {
                      inner: 'fL+mQMrLORkNyDZjWyv2zcCwef7rT93t9+/VVFxXJgw=',
                    },
                  },
                },
              },
              payloadKey: {
                inner: 'gbPc0atmBagfVXOXGqlGzrN72945ei36eC8mdXBqDmg=',
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
                      inner: '5LGElYM7UCex9oVWgBfgfo1iQkTSm5Z1DZAPFUW+NQo=',
                    },
                    ephemeralKey: '0g8xqLhvfT+h/dfX90f7xF7Jyyv4tCXzLCBKXhUyKRI=',
                    encryptedNote: {
                      inner:
                        'p4051rDIv7tVLIqGk7cagA6O+Km2Byo0yscU1DFCgJkkdQnkEFabmJS601rLQ7tsyh/+FPEnb0dSIi00S1rmLCya2tRlRS4ru6WtBjchw6vn9To/S5qbGVMD6l3siIxJo9RVrAaNFE35ForqpZpCXqPctiHKC30dSMHG0+O9MPKzRqlwCJKDOezUR1rrPZV+ukvB1KU6QUpHnZtQFLQnMW7cZmOzp5SraYksZqhoTy4=',
                    },
                  },
                  balanceCommitment: {
                    inner: 'jttI7PeS8mE1wp+COaVNuu7HOBFkrTCWThyZLrobvww=',
                  },
                  wrappedMemoKey:
                    'nyv6CdQkZqOMTGP0mBAv3ec01+g4v4HCmUKuup7cG+Dz6M5Jb1welFOmicaImiM+',
                  ovkWrappedKey: 'i9FMZLMduuTBQQ2t3QXSXAgf4aWHA1eTJAsGEKcoQPDXReWdVNC1/V2OXhiXLxcp',
                },
                proof: {
                  inner:
                    'fW2/mxyDh+X5bxGeOzSp/OoGyqDkd2///6wzQZaIEZRyHSpG1+/8ZGZ8EI0YU7KAPjzCqPd7Nkb+nTHp/KWFV3Uu4IxNs4mbAKIyeYII2NybTphQdC3MzRZg+oTkH2IABdqP4X2hdBZ28zntxXSdicA3lq+fQfD6KxfrJpA80d9BLTqJsrFI0dRwCSF6LLOAgXpvlsM16IYtb0ykQ9q5cBmvsXdvPliAIAq5Pi40j05XX/tb+msZ6RLhdXnqkgMA',
                },
              },
              note: {
                value: {
                  knownDenom: {
                    amount: {
                      lo: '10000000',
                    },
                    denom: {
                      denomUnits: [
                        {
                          denom: 'gm',
                          exponent: 6,
                        },
                        {
                          denom: 'mgm',
                          exponent: 3,
                        },
                        {
                          denom: 'ugm',
                        },
                      ],
                      base: 'ugm',
                      display: 'gm',
                      penumbraAssetId: {
                        inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=',
                      },
                    },
                  },
                },
                rseed: 'rjTIozgK0N+GGDJnwvns2++5fMTIJ6PaZGrycq6rJdc=',
                address: {
                  visible: {
                    address: {
                      inner:
                        '2VQ9nQKqga8RylgOq+wAY3/Hmxg96mGnI+Te/BRnXWpr5bSxpLShbpOmzO4pPULf+tGjaBum6InyEpipJ+8wk+HufrvSBa43H9o2ir5WPbk=',
                    },
                    index: {
                      randomizer: 'AAAAAAAAAAAAAAAA',
                    },
                    walletId: {
                      inner: 'fL+mQMrLORkNyDZjWyv2zcCwef7rT93t9+/VVFxXJgw=',
                    },
                  },
                },
              },
              payloadKey: {
                inner: 'gbPc0atmBagfVXOXGqlGzrN72945ei36eC8mdXBqDmg=',
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
                      inner: 'GuHzSMZYeSJvb07AgErw50TH13xxE5SMD7fPmH8N+gA=',
                    },
                    ephemeralKey: 'ZAQfdUWQRWFSaCGVeThQtiWQWE2BXPqr+45L+3Rqlw0=',
                    encryptedNote: {
                      inner:
                        '96BGfrpJL3ir7pO4GW6YKZjlqR/qf5Fa+qxFpqH+rRJg7JDXL525HpZy8VoQWLsXaTsnGVERwyPoGZG291LAY5rUZDGMIs8v5Pyfn4mLnTPzeH6abr/cOvVTmJ4h4642z7KhdGyo5IbXdGyCkbgWydTePv0KmD9M8s4UW/F15rpds+gQIGz2AE4+12+4jPr++oangCNLf4pEmwiKjBlx0IihrNxk1/6kTRuAfL4VI8g=',
                    },
                  },
                  balanceCommitment: {
                    inner: 'IvBWZSjXNrtEFuLlbawHFN61dglil7l55i+GwG8PbgY=',
                  },
                  wrappedMemoKey:
                    'U3llcLx+1omlkP+/C1QQAMDoyuRaAcBwDjIQjtDQL6F1q4JF9PRTvrYikhdtOJZJ',
                  ovkWrappedKey: 'CFRgB/mTvu+MpaoLzJ7iEqs3ndKsMNA9eGE3rPJLcIWRbCWpv7YMx9szPzTmZAQ1',
                },
                proof: {
                  inner:
                    'CzpdU4xERq3c+XtOPYvEZkvvQZOBK7uLoBoBqJGeDnzDonmaOXh4KR93f3VzMniA3KEeT46K+KxDTQ54pKQU8gk7OeYtQzbTLEiMTIIcmNLnZ2Ec2//zLOi0d7M/TXgBi3H4g6rLqbRcU7W7cxHyYvbNOBmM6Oi+SMMuLAKpRzBT8ygmIvMDnwxa1o5zeG0B1TWh2HLQFzGVUgT4517B+6nOj4/gJy7lofIiOvr8pAZsz2InVDNoxwf13DttoxcA',
                },
              },
              note: {
                value: {
                  knownDenom: {
                    amount: {
                      lo: '10000000',
                    },
                    denom: {
                      denomUnits: [
                        {
                          denom: 'gn',
                          exponent: 6,
                        },
                        {
                          denom: 'mgn',
                          exponent: 3,
                        },
                        {
                          denom: 'ugn',
                        },
                      ],
                      base: 'ugn',
                      display: 'gn',
                      penumbraAssetId: {
                        inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=',
                      },
                    },
                  },
                },
                rseed: 'GnJfwI1oPFhtFTUBiBhb3lKz/X0BSQNir1klL+pzgsE=',
                address: {
                  visible: {
                    address: {
                      inner:
                        '2VQ9nQKqga8RylgOq+wAY3/Hmxg96mGnI+Te/BRnXWpr5bSxpLShbpOmzO4pPULf+tGjaBum6InyEpipJ+8wk+HufrvSBa43H9o2ir5WPbk=',
                    },
                    index: {
                      randomizer: 'AAAAAAAAAAAAAAAA',
                    },
                    walletId: {
                      inner: 'fL+mQMrLORkNyDZjWyv2zcCwef7rT93t9+/VVFxXJgw=',
                    },
                  },
                },
              },
              payloadKey: {
                inner: 'gbPc0atmBagfVXOXGqlGzrN72945ei36eC8mdXBqDmg=',
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
                      inner: 'VZvk7tv1zn/hSti2nLpL6x7gAHzJUbdkIy5LDR70kBE=',
                    },
                    ephemeralKey: 'HnWYIW5yBrSjxzgGf3fNLY3C3RkwrX6XuW7/RO8qqhE=',
                    encryptedNote: {
                      inner:
                        'N4VY6GxAOfDo/CtV3TggMTnS9qdp8ixYkJktrrw3YtmsQusyVd8BQPggnbpC3XyhOabe0phE5+BFr07EwCDH71bGO/7FglAPV3zCA2G1rKLGge5GeRz7mlorDvueAx/T9286Vx8DN2dRBfgLEGw5YmLjsUISVH9hAPk4KzjBgAQqBeNxATv7PROUhjnp8fO8DrEe9fL7lWnjhtTd7Id1s23aIshpTIEOQG21CgOQxdY=',
                    },
                  },
                  balanceCommitment: {
                    inner: 'dOxUDjSlcIAL+W5YtUKpodErvfz7S53YlR6uke1iWwk=',
                  },
                  wrappedMemoKey:
                    'DJUfS5jfFyoBb6E4H/ATFpG5CjcPJPC9RmuzKrDIzVG+it+/Y7KBpN2ABGrJL5WC',
                  ovkWrappedKey: 'l6YPHV8bxB1oPbAcBLtDAc1Aq20kD5U4+oZRpYj59bviXUzfCIvnITfuanhJtrOG',
                },
                proof: {
                  inner:
                    'xxwfTg9Reb/WGu4wmUkWUarpLeU2vRXAE8Btc6QHExK398wytGzxlsyNY2S7qXoBJHFVcRv6Tx3oC6dZ5fAoGpzJI7uEN70i/eJOSZbHLTA6XY0VOrkA2P3zIbgLZu8A6cyW3hl7uMBphf6bqLyxsGFUZu7noSHUb4AnW5Wfod2giwsIm9/kzjpBDf3iQ9kASJBJTffLAvszNUVrR3mrJC0wEdqPTtoz84Iyy7VUzkcAJmi/P+AIJJIRtdnp7IqB',
                },
              },
              note: {
                value: {
                  knownDenom: {
                    amount: {
                      lo: '3875820019684212736',
                      hi: '54',
                    },
                    denom: {
                      denomUnits: [
                        {
                          denom: 'test_usd',
                          exponent: 18,
                        },
                        {
                          denom: 'wtest_usd',
                        },
                      ],
                      base: 'wtest_usd',
                      display: 'test_usd',
                      penumbraAssetId: {
                        inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
                      },
                    },
                  },
                },
                rseed: 'G7EDdbDKJFpPO8jT4aqxUrDuJ117rI5a/+GHh1J9Xso=',
                address: {
                  visible: {
                    address: {
                      inner:
                        '2VQ9nQKqga8RylgOq+wAY3/Hmxg96mGnI+Te/BRnXWpr5bSxpLShbpOmzO4pPULf+tGjaBum6InyEpipJ+8wk+HufrvSBa43H9o2ir5WPbk=',
                    },
                    index: {
                      randomizer: 'AAAAAAAAAAAAAAAA',
                    },
                    walletId: {
                      inner: 'fL+mQMrLORkNyDZjWyv2zcCwef7rT93t9+/VVFxXJgw=',
                    },
                  },
                },
              },
              payloadKey: {
                inner: 'gbPc0atmBagfVXOXGqlGzrN72945ei36eC8mdXBqDmg=',
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
                      inner: 'v00WG4eq2UfFceMbEePaWakxAEuyXkNpiR/RhUIP3gw=',
                    },
                    ephemeralKey: 'IN7b2urD0lenpjQHDqfcc3d8XXCgsKpASqyJDoPZzws=',
                    encryptedNote: {
                      inner:
                        'me0HxTd9Ca5SRXOPTCC9zbJ4fi75eYgjNIDA/7Uf6jcntYij6lMg5OoUBr1MKNYG44mJWxUBNmaG0iZ1k/P+KNVc9aCqCAdZJBT/72Cw9KCOa4Z3dYhmwW9JVwFEVN4taeNi81xi+nLd/0BzrKAMJCCLkH5z7tUztCXvZGcK26AGsqUa5M3JadsmwtAmAa0mhtP8Nvj1GCxtfnyxFiOTw6iF4xnRxcT97LkrF43jPPM=',
                    },
                  },
                  balanceCommitment: {
                    inner: 'xhEvO8D8VosI/rXowFT18XKphHx2KE/flhsueexl4hE=',
                  },
                  wrappedMemoKey:
                    'aqV0AB1qGm+H7MANkV7GOf+gy9yol9Zeq1KJCiwv2P+JxrCneSMnNYod3eAToWGn',
                  ovkWrappedKey: '86CR823j7a/R8PTy9KmlXBPoRVDtqmjuuSWgSRa9Lv5lxHuS0N5aSDQ7udlhgx9M',
                },
                proof: {
                  inner:
                    'l8neFhNDPbJ1AqemLyIdMbwAtUBrs60ea36j9upZKo7gtTsryYDYhCimNLlt2SgAQDrAAW+t6Do4DDv14x9GLFifBiw2bnbbtf97JUDGKZJ8T8H5RQdpfOCEIiC5lAUB82DDjN8LeAjkfUHybqBytvsNCRuULznIbKTT8LJm8OJXsbH60/F/lkuI38KyI78AWjZks2sdX141IT51czpMGNs1NepX/d739+dcdsmoQSMU8OSrVNns4eZNvknS+3SA',
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
                      inner: 'WinDFqc8CqAxkr/NOQHNtSO+6Ro7u/lGD6slOYR1lg0=',
                    },
                    ephemeralKey: 'pBtwFCcA/FC22GzngcQrvWk/+2++b+2uo3QahfjkMgQ=',
                    encryptedNote: {
                      inner:
                        '6Gqpf/x3cd1g1hQ1U2b4nNok5SpYuEwwWg5nUtDHYS9CZz35+dg9XbqDUtFP74mVjYbxVB4+qXr2F2HiT8WrX0artkKS4/iWNxe4KlxnG1g/cLcTreZ1S36OH7rVXzcMQWFEgYH8HCKkTvIuMNnQr6E+uTUaX1qIj0gpKCMMfqzFtFAPQVKlHTNkHB+2gY9c6MOa3r/HfGehDgnk5t7S+hYha/hYmcV193GYSIIalE0=',
                    },
                  },
                  balanceCommitment: {
                    inner: 'wsJeHMoAbyf/NTCUwX0kOLUxEOQF303v2WlFOkzkGAw=',
                  },
                  wrappedMemoKey:
                    'gMvMDEebtNu2MgbaSESx0X5NoIHgBjnd7EFVQF6wPorDV3Zxn8QrXHIUqfhQX7tB',
                  ovkWrappedKey: '9z9jH7JMS+/0uOQ+wGbQnir+YUWZHXGOGtMG6O7GZYz7SCMCyMweiwk/Tu0ATnZv',
                },
                proof: {
                  inner:
                    'Q2Oberg+JGR2QrG+3lxCkcVko7XDlbQBPWe1DeytG7rdco7NVPZw7mGMDmqhfOGA+QMeo4xXV+vFmpP8e2qS5E5kJW3MVMs/QFhs8nptPNqm14aF27U9vsPVJpeio4MBlDVi+TAsjVk2zQ/lFw33l5Dla4fne1cMFrYPaG6WrwH5YQYZuaJzz5bUX+FGnlQBtfZl3YlGDYZHL0NijuM9jujzpjAh/p6ROIKNZahMXSxsSHp7iQsO0cwQFw4y87gA',
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
                      inner: 'mycDZGRmawM/gn5mcSLdekUcwayLwCBaPNdvVhL41Qk=',
                    },
                    ephemeralKey: 'MAraIMUu/UiY5oQeo6Jh6Tm3sS3a5uqqGXiGDKmc/AM=',
                    encryptedNote: {
                      inner:
                        '3pJ7goLAX/kHPRPqzhPJ3fYMrS0PvKxESdfcvxWB7b8MPByC34G/HkMDqjx6/DO599ubAJM5LsFpGrnhGPtE0hg+GNu8W+d54oRd3qJ2Uh5LtvXfGK0zM0qBXSXKIkXBEOGODZJ6f2L+m9qX6roK1J59VodCIa1wEBVuPbXogcq/CYn3L0A3ot7Yj9MWYQnZ0QcW1s0g/NkaNonHnhz6UWsK1U3zaPRih10p/GoapXg=',
                    },
                  },
                  balanceCommitment: {
                    inner: 'PKW0VKrMuencxQGVVUq5Rjp0OQZvrpXHlanBwyVC1gU=',
                  },
                  wrappedMemoKey:
                    'gbYRvDj2DmvyqB0MrVqAydcOmCcFbmOF4wrFNaZtx/stz7n0CjEuUdH4LJV99LZ+',
                  ovkWrappedKey: 'A/2JWy9UhF3xx7wXfhf8735w7HlzT5KBWT6V4yKJNw8xirQ7luzpGs+lyQkw7+Ke',
                },
                proof: {
                  inner:
                    'm+yVsZSP2w0SvlakWAyypRI8zZFZ000XwA3lf6UF8xDP/b7wZyHiyZof8dMy2TwBwodfNx2D9vxBax73RVBovUjceqGhYU5MqxFkjIlREH1U0rKgMqRVayzzStnzbdUA4Lf7ByeQAjm7DlyK03tfedaiXV4jkPyEoyI9m78A74O0qPzCdUExFoDUx3/XC2+Bog1NvDN5NFmP/XBOl3ZMJDH1rcBkskHipdGiSE92V+c9Mtdea3vWX7C+ebD5sSEA',
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
                      inner: '/mmvwP2dPRNkX4IJiq+7ZfXsubsoCY9gp2N/9ugHqRI=',
                    },
                    ephemeralKey: 'xhgPCiRjN6snO5qlsdRpA7oCUVRWxpE8n7/Z2uU60gw=',
                    encryptedNote: {
                      inner:
                        'ayaHlEzPbu8QJwtLea/WxhucXytntgXhLFfrIf8YrHkuYewBDEIuMjyQJ1q6zHjXVt46QF0bcXDi5rfnFepdVyLiS0z3ZQAO73SGuPOJegiwgz0iPgngMpqE39S2m5VH8saFzRzywkTQpWsR//naWB5oqfS3/AVpNUwzm9Mnvme4LImyR3vWT4dbvsYVsmQgcXK/mYjb5KRtTyxzqe3PnLFTIRbGCKeRFEZ7My0QgG8=',
                    },
                  },
                  balanceCommitment: {
                    inner: 'aqUqgKx/4+12S6yk6hUCurgMTxiJ286AcfjVGPiORAM=',
                  },
                  wrappedMemoKey:
                    'hu4iFAe9hP7zBAOw5xaBWv2TSaLzhQ/1oJhkSp5Ug2M2pr/EZhJGSLOvix501AcM',
                  ovkWrappedKey: 'uZYJSJUbd9R6LB5ii508XyxLJtIvWjZ6co88VTKEL/33lkMvhsIxTZyp+RZKS4cF',
                },
                proof: {
                  inner:
                    'TTjJyg3Wo8a5IYfhwCynxLuY25413eUpl17F6ZBw6tbBKzCBcPCESpcwhEZSmNGAjFM8v5H7Wh6qmDa/gG3AIJANB0ZDShaMO/tlaBBRc+vTmDU9xMvsnfZtAlMa2YoBuwmjkjFcu2bz0c08jjp6Tg3K9RkjPWA685UDZVnHjDzVet+lVeCeah1IDiYiBKQAAjpa2vXwC6kGCACV6I8HXSMx27faqX7mQMFVNve9p8isXbyQWqzJax+z24Kjh08A',
                },
              },
            },
          },
        },
      ],
      transactionParameters: {
        chainId: 'penumbra-testnet-rhea',
      },
      fee: {
        amount: {},
      },
      detectionData: {
        fmdClues: [
          {
            inner:
              'vCPE22JFgv8JPOWri+IknthYYx5bbUBwqrSnL2Ko2hGtDfh7NRI3lI8Co5Zei8+4jUcaJctQkGrYD0uXwI5SBAAAAAA=',
          },
          {
            inner:
              'FCuaszw2jXO9bjcKHtXBTNpK80fg4qF1RuV8o19kHgJCh0Gg+OfHjuds5Qpnp73oZBr4zOrxVojO3cCRNv5KAQAAAAA=',
          },
          {
            inner:
              'CnlKAo3MOrejUQJYobus9R0mx0s5B2N3RD9KHCy+1gZipbCHMWsxQtNI4Aq6mne0lEpjimOkJBoIfV7rd4dsAgAAAAA=',
          },
          {
            inner:
              'EtmIfw5uII1WoDURC9Fwt5XvWOUNSYmhz4IvdMZocwO9783PQd+DcfnjBkT2JRUj8ZWRlULSxmoUemdyrnWWAAAAAAA=',
          },
          {
            inner:
              'MHMLUbB/CJasfDn5SrNzU86/ADJ80vRlp14fp5BACg4+5TST+rgMVxWI4G65Z/TT3NEFU/od8WSCSwrBPFB1BAAAAAA=',
          },
          {
            inner:
              'TLjYWauiUprJeZvQm7pn7qhGgQqGpdUO8XY168bUFgbIaGZAucv8+Ih9oprdDJtwu+u6XMOthV0lxXcExWAJAAAAAAA=',
          },
          {
            inner:
              'rpz7S5DAzY+vBfnpx6v+XGeQGIAVQHJdfPDX0GM1FxHN++wjE99MUgQWj7PQ/xor8Bq78LXCyFV4sBqAe9rzAgAAAAA=',
          },
          {
            inner:
              'go/zUaQciHzEjoBJcwZw7hAr3nGoscaPxnRg5iiUYwTlE3kMXx6RfbQqkMrzSz+cVR0j8d9FzMk3+I+efM0EAwAAAAA=',
          },
        ],
      },
      memoView: {
        visible: {
          ciphertext: {
            inner:
              'NGJ0T7iaorVP2ApR/78bejqFVn87DO+2vcaogbZYf5VvL6HvazSfYGiLq52c24n4ZfYGtN1z8dTyVknbJ9JawwComzYZ7kkWlQyUbXuKIGCowgxuv0dZ+5QXPuL7acycgnVXlzkfPH6CJylHKhWPb1Wskdk5KJaM+I2ofKi69LPtkIQhYcy3Prc7/nAwytxdjcWjsvS3bjRfry+F4ch8n+2EcUklygz2wnAr21crV6Hd855q+/OZKyEpWkODTB4wuYetm4b8laFklWKWDhFzezdmIUXgf/RSVIgk51H5hThVauH8m1dg4kW/5wklVCrzJjrem2/T/KnIIJEcxzuQ85Smk86fWycgnraQ80Sy9G1nU8rqwBE4KUFLQ6OVu5z0pfYH3DaYKTpVmOsvwCz2l2+me9U6JIB5jiQRvdcjjmPquDIhPbOSNlKRmLa6tmvEqM0Y7rxT1MnbR3Cdzp+30gwruLg0oiTm80N1Ltdkwv2+0uR8iSAfSVmW9o05/Lnqt548hGS/bW3LDX7BHV/Jq464prPUOejEqiFPHjohHlC3hs4T3k8if9euY5DIBwk5evwQ+rNE2E/x8g/wjJyWLp+Nslms8E66ecHWUNgQb5i6NiLwZ8f15/kdrG+ioZj1d/S0hTC9JgZCTEmcvfNBKxOw7ge93cxRmv7Sj688QA5acUDAejinEZmvXXyRV2AD',
          },
          plaintext: {
            text: 'Hello from Galileo, the Penumbra faucet bot',
          },
        },
      },
    },
    bindingSig:
      'VDwfYSlhod90QLBvTdIM+T+WdscTjqecFp4PSeRhhwQX2Al3CHo0Bikx3hix0iO4zF/EnRIuz4J70clixI9VAg==',
    anchor: {
      inner: 'mrchwun83TOMYsdXtkBSdUYXXMzlg6N2NYfEcqWmfwE=',
    },
  },
});
