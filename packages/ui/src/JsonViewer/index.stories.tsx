import type { Meta, StoryObj } from '@storybook/react';
import { JsonViewer } from '.';
import { Text } from '../Text';

// Realistic Penumbra transaction data based on actual codebase structures
const penumbraSpendAction = {
  spend: {
    body: {
      balanceCommitment: {
        inner: 'mLSHGBzim3wSsFOn431tR9fsD+RcPXK1hn7FtxYOlws=',
      },
      nullifier: {
        inner: 'knpvZH3soGxnNVQZcvlA+VMuvCZWVCgknts1mowDSgg=',
      },
      rk: {
        inner: 'cmAa4EqbtHC5lhoVU6PGJfJl06QpBga4eO3cuF/8MAU=',
      },
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
};

const penumbraOutputAction = {
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
};

const realisticPenumbraTransaction = {
  body: {
    actions: [
      penumbraSpendAction,
      {
        spend: {
          body: {
            balanceCommitment: {
              inner: 'LnUs6kKZ+9MO+J+bHiDFm+WRnHEWgIjkw7ieivpQ7xE=',
            },
            nullifier: { inner: 'iKtEKV32USvsFJINbWs8WlpGrf4ISt+D61LkVzAyPwY=' },
            rk: {
              inner: 'oIpHfSwEialuU436KIw9tXR3wWpgk0NHIcc17dRnYQM=',
            },
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
      penumbraOutputAction,
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
    ],
    transactionParameters: {
      chainId: 'penumbra-testnet-rhea',
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
      ],
    },
    memo: {
      inner:
        'NGJ0T7iaorVP2ApR/78bejqFVn87DO+2vcaogbZYf5VvL6HvazSfYGiLq52c24n4ZfYGtN1z8dTyVknbJ9JawwComzYZ7kkWlQyUbXuKIGCowgxuv0dZ+5QXPuL7acycgnVXlzkfPH6CJylHKhWPb1Wskdk5KJaM+I2ofKi69LPtkIQhYcy3Prc7/nAwytxdjcWjsvS3bjRfry+F4ch8n+2EcUklygz2wnAr21crV6Hd855q+/OZKyEpWkODTB4wuYetm4b8laFklWKWDhFzezdmIUXgf/RSVIgk51H5hThVauH8m1dg4kW/5wklVCrzJjrem2/T/KnIIJEcxzuQ85Smk86fWycgnraQ80Sy9G1nU8rqwBE4KUFLQ6OVu5z0pfYH3DaYKTpVmOsvwCz2l2+me9U6JIB5jiQRvdcjjmPquDIhPbOSNlKRmLa6tmvEqM0Y7rxT1MnbR3Cdzp+30gwruLg0oiTm80N1Ltdkwv2+0uR8iSAfSVmW9o05/Lnqt548hGS/bW3LDX7BHV/Jq464prPUOejEqiFPHjohHlC3hs4T3k8if9euY5DIBwk5evwQ+rNE2E/x8g/wjJyWLp+Nslms8E66ecHWUNgQb5i6NiLwZ8f15/kdrG+ioZj1d/S0hTC9JgZCTEmcvfNBKxOw7ge93cxRmv7Sj688QA5acUDAejinEZmvXXyRV2AD',
    },
  },
  bindingSig: {
    inner:
      'VDwfYSlhod90QLBvTdIM+T+WdscTjqecFp4PSeRhhwQX2Al3CHo0Bikx3hix0iO4zF/EnRIuz4J70clixI9VAg==',
  },
  anchor: {
    inner: 'mrchwun83TOMYsdXtkBSdUYXXMzlg6N2NYfEcqWmfwE=',
  },
};

const penumbraTransactionView = {
  bodyView: {
    actionViews: [
      {
        spend: {
          opaque: {
            spend: {
              body: {
                balanceCommitment: {
                  inner: 'WLuSykAbmrlmU0vZp7jI5Y8lKk4BLrKmStxKu3lQ9Qo=',
                },
              },
            },
          },
        },
      },
      {
        output: {
          visible: {
            note: {
              value: {
                knownAssetId: {
                  amount: {
                    lo: '1900000',
                  },
                  metadata: {
                    display: 'penumbra',
                    name: 'Penumbra',
                    symbol: 'UM',
                    denomUnits: [
                      {
                        denom: 'upenumbra',
                        exponent: 0,
                        aliases: ['upenumbra'],
                      },
                      {
                        denom: 'mpenumbra',
                        exponent: 3,
                        aliases: ['millipenumbra'],
                      },
                      {
                        denom: 'penumbra',
                        exponent: 6,
                        aliases: ['penumbra'],
                      },
                    ],
                    base: 'upenumbra',
                    penumbraAssetId: {
                      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
                    },
                  },
                },
              },
              address: {
                addressView: {
                  case: 'decoded',
                  value: {
                    address: {
                      inner: 'pWu2mIkTb3QTktgAUWUoi3p4nYO93u42cMcxOK6w1gTxRY0xr2dG1zlrAALKCAMA',
                    },
                    index: {
                      account: 0,
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
    transactionParameters: {
      chainId: 'penumbra-1',
      fee: {
        amount: {
          lo: '1013',
        },
      },
    },
    memoView: {
      visible: {
        plaintext: {
          text: 'Welcome to Penumbra! 🌗',
          returnAddress: {
            opaque: {
              address: {
                inner:
                  '/QcI99iWWEoppooVTGEK2fvmSKVoqmx8vD8wfgx82NZxikBjgUA01E8j1XqdkrjbQ2OcslLElBz1XkY14BidEBiynrWbUf+GQdcPYyIybRc=',
              },
            },
          },
        },
      },
    },
  },
};

const penumbraSwapData = {
  transaction: {
    id: {
      inner: 'tC8UkRa/CMAtIft8TgIHRTWS7D8KNA+nYlixMl0mYjU=',
    },
    height: 123456,
    actions: [
      {
        action: {
          case: 'swapClaim',
          value: {
            proof: {
              inner:
                'A5LjK2OeSKePyZE3T0ZyN7I9RjKmE+yCKzHN9G8BCPR8+5QiPPbZC8H/Wr1N6/2A6VNQWv5QLb4MZmzT5K3Uxz+J7',
            },
            body: {
              nullifier: {
                inner: 'B3XzzNvAuT3hMVqTfAAN6m9UlODZ9fldv3OyA55ABAs=',
              },
              fee: {
                amount: { lo: '1000', hi: '0' },
                assetId: {
                  inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
                },
              },
              epochDuration: 719,
            },
            epochProof: {
              inner: 'QzT8x3YFhuf8l7NMKgG9pZ2YRvE8K4vPJc7mF9KWrA8z4LnGhv3XYZJ5K+H2O8/1B7',
            },
          },
        },
      },
    ],
    anchorHeight: 123400,
  },
  blockHeight: 123456,
  timestamp: '2023-10-15T14:30:00Z',
};

const penumbraPositionData = {
  position: {
    phi: {
      component: { p: { lo: '1000000' }, q: { lo: '1000000' } },
      pair: {
        asset1: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
        asset2: { inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=' },
      },
    },
    nonce: 'QvdZ/22Fhufk9ea3nxSedhYP3C0LHW5HtbMlp27aIpY=',
    state: { state: 'POSITION_STATE_ENUM_OPENED' },
    reserves: { r1: {}, r2: { lo: '1000000' } },
  },
  positionId: {
    inner: 'qE/PCp65S+GHi2HFO74G8Gx5ansmxeMwEdNUgn3GXYE=',
  },
  tradingPair: {
    asset1: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
    asset2: { inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=' },
  },
};

const meta: Meta<typeof JsonViewer> = {
  component: JsonViewer,
  tags: ['autodocs', '!dev'],
  argTypes: {
    data: { control: false },
    collapsed: {
      control: { type: 'select' },
      options: [true, false, 1, 2, 3, 4, 5],
    },
    theme: {
      control: { type: 'select' },
      options: ['flat', 'monokai'],
      description: 'Theme for the JSON viewer. Flat is recommended for dark UIs.',
    },
    backgroundColor: {
      control: { type: 'select' },
      options: ['transparent'],
      description: 'Background color. Transparent inherits container background.',
    },
    modernStyle: { control: 'boolean' },
  },
  args: {
    collapsed: true,
    theme: 'flat',
    backgroundColor: 'transparent',
    modernStyle: true,
  },
};

export default meta;

type Story = StoryObj<typeof JsonViewer>;

/**
 * Basic JSON viewer with a single Penumbra spend action.
 */
export const SpendAction: Story = {
  args: {
    data: penumbraSpendAction,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows a single Penumbra spend action with balance commitment, nullifier, authorization signature, and proof.',
      },
    },
  },
};

/**
 * JSON viewer showing a Penumbra output action with encrypted note.
 */
export const OutputAction: Story = {
  args: {
    data: penumbraOutputAction,
    collapsed: 2,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Displays a Penumbra output action containing note payload with encrypted note data, balance commitment, and cryptographic keys.',
      },
    },
  },
};

/**
 * Complete Penumbra transaction with multiple actions and metadata.
 */
export const CompleteTransaction: Story = {
  args: {
    data: realisticPenumbraTransaction,
    collapsed: 2,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows a complete Penumbra transaction with multiple spend and output actions, transaction parameters, detection data, memo, and signatures.',
      },
    },
  },
};

/**
 * Penumbra transaction view with visible and opaque actions.
 */
export const TransactionView: Story = {
  args: {
    data: penumbraTransactionView,
    collapsed: 3,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Displays a transaction view containing both visible and opaque actions, with decoded asset metadata and memo information.',
      },
    },
  },
};

/**
 * Penumbra swap and claim transaction data.
 */
export const SwapTransaction: Story = {
  args: {
    data: penumbraSwapData,
    collapsed: 3,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows swap claim transaction data with proofs, nullifiers, fees, and epoch information specific to Penumbra DEX operations.',
      },
    },
  },
};

/**
 * Penumbra DEX position data structure.
 */
export const PositionData: Story = {
  args: {
    data: penumbraPositionData,
    collapsed: 2,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Displays DEX position data including trading pair, reserves, position state, and associated identifiers.',
      },
    },
  },
};

/**
 * Different collapse levels for complex transaction data.
 */
export const CollapseVariants: Story = {
  render: args => (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2'>
        <Text h4 color='text.primary'>
          Fully Collapsed
        </Text>
        <JsonViewer {...args} data={realisticPenumbraTransaction} collapsed={true} />
      </div>

      <div className='flex flex-col gap-2'>
        <Text h4 color='text.primary'>
          Level 1 (Show main structure)
        </Text>
        <JsonViewer {...args} data={realisticPenumbraTransaction} collapsed={1} />
      </div>

      <div className='flex flex-col gap-2'>
        <Text h4 color='text.primary'>
          Level 2 (Show actions)
        </Text>
        <JsonViewer {...args} data={realisticPenumbraTransaction} collapsed={2} />
      </div>

      <div className='flex flex-col gap-2'>
        <Text h4 color='text.primary'>
          Level 3 (Show action details)
        </Text>
        <JsonViewer {...args} data={realisticPenumbraTransaction} collapsed={3} />
      </div>

      <div className='flex flex-col gap-2'>
        <Text h4 color='text.primary'>
          Fully Expanded
        </Text>
        <JsonViewer {...args} data={realisticPenumbraTransaction} collapsed={false} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows different collapse levels for exploring Penumbra transaction data: from high-level structure to detailed cryptographic proofs.',
      },
    },
  },
};

/**
 * JSON viewer optimized for dark mode interfaces.
 */
export const DarkModeUsage: Story = {
  render: args => (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2'>
        <Text h4 color='text.primary'>
          Flat theme (default) - Optimized for dark UIs
        </Text>
        <JsonViewer {...args} data={penumbraSwapData} theme='flat' collapsed={2} />
      </div>

      <div className='flex flex-col gap-2'>
        <Text h4 color='text.primary'>
          Monokai theme - Alternative dark theme
        </Text>
        <JsonViewer {...args} data={penumbraSwapData} theme='monokai' collapsed={2} />
      </div>

      <div className='flex flex-col gap-2'>
        <Text h4 color='text.primary'>
          Transparent background - Inherits container styling
        </Text>
        <div className='rounded bg-other-tonalFill5 p-4'>
          <JsonViewer {...args} data={penumbraPositionData} backgroundColor='transparent' />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "JSON viewer themes and styling options optimized for Penumbra's dark mode interface.",
      },
    },
  },
};

/**
 * Edge cases and special data structures.
 */
export const EdgeCases: Story = {
  render: args => (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2'>
        <Text h4 color='text.primary'>
          Empty Transaction Body
        </Text>
        <JsonViewer {...args} data={{ body: { actions: [] } }} />
      </div>

      <div className='flex flex-col gap-2'>
        <Text h4 color='text.primary'>
          Base64 Encoded Data Array
        </Text>
        <JsonViewer
          {...args}
          data={{
            encryptedData: [
              'R/Gf/zakltAbRg0shbrd85bP4phrFZ4Msuw+gUjD3qGgsChIVIrLpSSOTtMlJpKC',
              'mLSHGBzim3wSsFOn431tR9fsD+RcPXK1hn7FtxYOlws=',
              'knpvZH3soGxnNVQZcvlA+VMuvCZWVCgknts1mowDSgg=',
            ],
          }}
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Text h4 color='text.primary'>
          Mixed Data Types in Transaction
        </Text>
        <JsonViewer
          {...args}
          data={{
            height: 123456,
            timestamp: '2023-10-15T14:30:00Z',
            success: true,
            nullValue: null,
            bigNumber: { lo: '1000000000000', hi: '0' },
            array: ['action1', 'action2'],
            nested: { deep: { value: 'test' } },
          }}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows how the JSON viewer handles edge cases commonly found in Penumbra transaction data.',
      },
    },
  },
};

/**
 * JSON viewer with custom loading fallback for async transaction loading.
 */
export const CustomLoading: Story = {
  args: {
    data: realisticPenumbraTransaction,
    loadingFallback: (
      <div className='flex items-center justify-center rounded bg-other-tonalFill5 p-8'>
        <Text detail color='text.secondary'>
          🔄 Loading Penumbra transaction data...
        </Text>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Custom loading fallback UI for when transaction data is being fetched or processed.',
      },
    },
  },
};
