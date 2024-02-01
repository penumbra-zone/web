import { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { FeeTierSelector } from './fee-tier-selector';
import { FeeTier_Tier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';

const meta: Meta<typeof FeeTierSelector> = {
  component: FeeTierSelector,
  title: 'FeeTierSelector',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FeeTierSelector>;

export const Basic: Story = {
  args: {
    value: FeeTier_Tier.LOW,
  },

  render: function Render({ value }) {
    const [, updateArgs] = useArgs();

    const onChange = (value: FeeTier_Tier) => updateArgs({ value });

    return <FeeTierSelector value={value} onChange={onChange} />;
  },
};
