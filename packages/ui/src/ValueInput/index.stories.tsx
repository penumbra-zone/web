import type { Meta, StoryObj } from '@storybook/react';

import { ValueInput } from '.';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { useState } from 'react';
import {
  OSMO_BALANCE,
  OSMO_METADATA,
  PENUMBRA2_BALANCE,
  PENUMBRA_BALANCE,
  PENUMBRA_METADATA,
  PIZZA_METADATA,
} from '../utils/bufs';
import { AssetSelectorValue } from '../AssetSelector';

const balanceOptions: BalancesResponse[] = [PENUMBRA_BALANCE, PENUMBRA2_BALANCE, OSMO_BALANCE];
const assetOptions: Metadata[] = [PIZZA_METADATA, PENUMBRA_METADATA, OSMO_METADATA];

const meta: Meta<typeof ValueInput> = {
  component: ValueInput,
  tags: ['autodocs', '!dev'],
  argTypes: {
    value: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof ValueInput>;

export const MixedBalancesResponsesAndMetadata: Story = {
  args: {
    label: 'Value Input',
    dialogTitle: 'Transfer Assets',
    assets: assetOptions,
    balances: balanceOptions,
    placeholder: 'Input value...',
  },

  render: function Render(props) {
    const [value, setValue] = useState<string>('');
    const [selection, setSelection] = useState<AssetSelectorValue>();

    return (
      <ValueInput
        {...props}
        value={value}
        onValueChange={setValue}
        selection={selection}
        onSelectionChange={setSelection}
      />
    );
  },
};
