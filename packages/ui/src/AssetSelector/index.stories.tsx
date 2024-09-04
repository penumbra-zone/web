import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { AssetSelector } from '.';
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

const mixedOptions: (BalancesResponse | Metadata)[] = [
  PIZZA_METADATA,
  PENUMBRA_BALANCE,
  PENUMBRA2_BALANCE,
  OSMO_BALANCE,
];
const metadataOnlyOptions: Metadata[] = [PIZZA_METADATA, PENUMBRA_METADATA, OSMO_METADATA];

const meta: Meta<typeof AssetSelector> = {
  component: AssetSelector,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {
    value: { control: false },
    options: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof AssetSelector>;

export const MixedBalancesResponsesAndMetadata: Story = {
  args: {
    dialogTitle: 'Transfer Assets',
    value: PENUMBRA_BALANCE,
    options: mixedOptions,
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onChange = (value: BalancesResponse | Metadata) => updateArgs({ value });

    return <AssetSelector {...props} onChange={onChange} />;
  },
};

export const MetadataOnly: Story = {
  render: function Render() {
    const [value, setValue] = useState<Metadata>(PENUMBRA_METADATA);

    return (
      <AssetSelector
        dialogTitle='Transfer Assets'
        value={value}
        options={metadataOnlyOptions}
        onChange={setValue}
      />
    );
  },
};
