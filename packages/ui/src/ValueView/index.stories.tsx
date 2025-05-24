import type { Meta, StoryObj } from '@storybook/react';
import {
  ValueView,
  ValueView_KnownAssetId,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import { ValueViewComponent } from '.';
import { TableCell } from '../TableCell';
import {
  DELEGATION_VALUE_VIEW,
  PENUMBRA_VALUE_VIEW,
  UNBONDING_VALUE_VIEW,
  UNKNOWN_ASSET_ID_VALUE_VIEW,
  UNKNOWN_ASSET_VALUE_VIEW,
} from '../utils/bufs';

const meta: Meta<typeof ValueViewComponent> = {
  component: ValueViewComponent,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {
    valueView: {
      options: [
        'Penumbra',
        'Delegation token',
        'Unbonding token',
        'Unknown asset',
        'Unknown asset ID',
      ],
      mapping: {
        Penumbra: PENUMBRA_VALUE_VIEW,
        'Delegation token': DELEGATION_VALUE_VIEW,
        'Unbonding token': UNBONDING_VALUE_VIEW,
        'Unknown asset': UNKNOWN_ASSET_VALUE_VIEW,
        'Unknown asset ID': UNKNOWN_ASSET_ID_VALUE_VIEW,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ValueViewComponent>;

export const Basic: Story = {
  args: {
    valueView: PENUMBRA_VALUE_VIEW,
    context: 'default',
    priority: 'primary',
  },
};

const increaseValueView = (valueView: ValueView, power: number) => {
  const amount = valueView.valueView.value!.amount!;
  const increased = pnum(pnum(amount).toBigInt() * BigInt(Math.pow(10, power) * power)).toAmount();
  return new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: increased,
        metadata: (valueView.valueView.value as ValueView_KnownAssetId).metadata,
      },
    },
  });
};

/**
 * Example of using the `ValueViewComponent` in a table with a `padStart` and `trailingZeros` props.
 *
 * In this example, `trailingZeros` populates the decimal part of the number with zeros
 * until token's exponent is reached. `padStart` is used to align the numbers in the table by
 * adding figure spaces to the start of the number until the total length of the formatted number
 * is equal to `padStart`.
 */
export const InATable: Story = {
  render: args => {
    const values = new Array(10)
      .fill(0)
      .map((_, index) =>
        args.valueView ? increaseValueView(args.valueView, index + 1) : undefined,
      );

    // An example of padStart calculation for a list of valueViews
    const dynamicPadStart = Math.max(
      ...values.map(v => {
        if (!v) {
          return 0;
        }
        const formatted = pnum(v).toFormattedString({ trailingZeros: true });
        return formatted.length;
      }),
    );

    return (
      <section className='grid grid-cols-2'>
        <TableCell heading>Index</TableCell>
        <TableCell heading>Reward</TableCell>

        {values.map((_, index) => (
          <div key={index} className='col-span-2 grid grid-cols-subgrid'>
            <TableCell>{index}</TableCell>
            <TableCell>
              <ValueViewComponent
                {...args}
                padStart={dynamicPadStart}
                valueView={args.valueView && increaseValueView(args.valueView, index + 1)}
              />
            </TableCell>
          </div>
        ))}
      </section>
    );
  },
  args: {
    valueView: PENUMBRA_VALUE_VIEW,
    trailingZeros: true,
    padStart: 25,
  },
};
