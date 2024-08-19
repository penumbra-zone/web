import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { AssetSelector } from '.';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { useState } from 'react';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));

const umAssetId = new AssetId({ inner: u8(32) });
const osmoAssetId = new AssetId({ inner: u8(32) });
const pizzaAssetId = new AssetId({ inner: u8(32) });

const um = new Metadata({
  symbol: 'UM',
  name: 'Penumbra',
  penumbraAssetId: umAssetId,
  base: 'upenumbra',
  display: 'penumbra',
  denomUnits: [{ denom: 'upenumbra' }, { denom: 'penumbra', exponent: 6 }],
});

const osmo = new Metadata({
  symbol: 'OSMO',
  name: 'Osmosis',
  penumbraAssetId: osmoAssetId,
  base: 'uosmo',
  display: 'osmo',
  denomUnits: [{ denom: 'uosmo' }, { denom: 'osmo', exponent: 6 }],
});

const pizza = new Metadata({
  symbol: 'PIZZA',
  name: 'Pizza',
  penumbraAssetId: pizzaAssetId,
  base: 'upizza',
  display: 'pizza',
  denomUnits: [{ denom: 'upizza' }, { denom: 'pizza', exponent: 6 }],
});

const umBalance0 = new BalancesResponse({
  accountAddress: {
    addressView: {
      case: 'decoded',
      value: {
        index: {
          account: 0,
        },
      },
    },
  },
  balanceView: {
    valueView: {
      case: 'knownAssetId',
      value: {
        metadata: um,
        amount: {
          hi: 0n,
          lo: 123_456_000n,
        },
      },
    },
  },
});

const osmoBalance0 = new BalancesResponse({
  accountAddress: {
    addressView: {
      case: 'decoded',
      value: {
        index: {
          account: 0,
        },
      },
    },
  },
  balanceView: {
    valueView: {
      case: 'knownAssetId',
      value: {
        metadata: osmo,
        amount: {
          hi: 0n,
          lo: 456_789_000n,
        },
      },
    },
  },
});

const umBalance1 = new BalancesResponse({
  accountAddress: {
    addressView: {
      case: 'decoded',
      value: {
        index: {
          account: 1,
        },
      },
    },
  },
  balanceView: {
    valueView: {
      case: 'knownAssetId',
      value: {
        metadata: um,
        amount: {
          hi: 0n,
          lo: 789_100_000n,
        },
      },
    },
  },
});

const mixedOptions: (BalancesResponse | Metadata)[] = [pizza, umBalance0, umBalance1, osmoBalance0];
const metadataOnlyOptions: Metadata[] = [pizza, um, osmo];

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
    value: umBalance0,
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
    const [value, setValue] = useState<Metadata>(um);

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
