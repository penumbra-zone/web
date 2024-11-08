import type { Meta, StoryObj } from '@storybook/react';

import { AssetSelector, AssetSelectorValue } from '.';
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

const balanceOptions: BalancesResponse[] = [PENUMBRA_BALANCE, PENUMBRA2_BALANCE, OSMO_BALANCE];
const assetOptions: Metadata[] = [PIZZA_METADATA, PENUMBRA_METADATA, OSMO_METADATA];

const meta: Meta<typeof AssetSelector> = {
  component: AssetSelector,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {
    value: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof AssetSelector>;

export const MixedBalancesResponsesAndMetadata: Story = {
  args: {
    dialogTitle: 'Transfer Assets',
    assets: assetOptions,
    balances: balanceOptions,
  },

  render: function Render(props) {
    const [value, setValue] = useState<AssetSelectorValue>();

    return <AssetSelector {...props} value={value} onChange={setValue} />;
  },
};
