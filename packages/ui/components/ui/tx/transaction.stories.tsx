import type { Meta, StoryObj } from '@storybook/react';

import { TransactionViewComponent } from '.';
import { TransactionView } from '@penumbra-zone/protobuf/types';

const meta: Meta<typeof TransactionViewComponent> = {
  component: TransactionViewComponent,
  title: 'TransactionViewComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof TransactionViewComponent>;

// TODO: construct a working transaction – right now it throws an error in Storybook
const EXAMPLE_TRANSACTION = new TransactionView({
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

export const Basic: Story = {
  args: {
    txv: EXAMPLE_TRANSACTION,
  },
};
