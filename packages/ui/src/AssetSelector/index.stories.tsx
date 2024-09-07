import type { Meta, StoryObj } from '@storybook/react';

import { AssetSelector } from '.';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { useMemo, useState } from 'react';
import {
  OSMO_BALANCE,
  OSMO_METADATA,
  PENUMBRA2_BALANCE,
  PENUMBRA_BALANCE,
  PENUMBRA_METADATA,
  PIZZA_METADATA,
} from '../utils/bufs';
import { filterMetadataOrBalancesResponseByText } from './utils/filterMetadataOrBalancesResponseByText.ts';

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
  },
};
export default meta;

type Story = StoryObj<typeof AssetSelector>;

export const MixedBalancesResponsesAndMetadata: Story = {
  args: {
    dialogTitle: 'Transfer Assets',
  },

  render: function Render(props) {
    const [value, setValue] = useState<Metadata | BalancesResponse>();
    const [search, setSearch] = useState('');

    const filteredOptions = useMemo(
      () => mixedOptions.filter(filterMetadataOrBalancesResponseByText(search)),
      [search],
    );

    return (
      <AssetSelector
        {...props}
        value={value}
        search={search}
        onChange={setValue}
        onSearchChange={setSearch}
      >
        {({ getKeyHash }) =>
          filteredOptions.map(option => (
            <AssetSelector.ListItem key={getKeyHash(option)} value={option} />
          ))
        }
      </AssetSelector>
    );
  },
};

export const MetadataOnly: Story = {
  render: function Render() {
    const [value, setValue] = useState<Metadata | BalancesResponse>(PENUMBRA_METADATA);

    return (
      <AssetSelector dialogTitle='Transfer Assets' value={value} onChange={setValue}>
        {({ getKeyHash }) =>
          metadataOnlyOptions.map(option => (
            <AssetSelector.ListItem key={getKeyHash(option)} value={option} />
          ))
        }
      </AssetSelector>
    );
  },
};
