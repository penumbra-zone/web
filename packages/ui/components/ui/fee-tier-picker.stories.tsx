import { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { FeeTierPicker } from './fee-tier-picker';
import { FeeTier_Tier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';

const meta: Meta<typeof FeeTierPicker> = {
  component: FeeTierPicker,
  title: 'FeeTierPicker',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FeeTierPicker>;

export const Basic: Story = {
  args: {
    value: FeeTier_Tier.LOW,
  },

  render: function Render({ value }) {
    const [, updateArgs] = useArgs();

    const onChange = (value: FeeTier_Tier) => updateArgs({ value });

    return <FeeTierPicker value={value} onChange={onChange} />;
  },
};
