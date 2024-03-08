import { describe, expect, it, vi } from 'vitest';
import { StakingActions } from '.';
import { render } from '@testing-library/react';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ComponentProps } from 'react';

const nonZeroBalance = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 1n },
    },
  },
});

const zeroBalance = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 0n },
    },
  },
});

const validatorInfo = new ValidatorInfo({ validator: {} });

const BASE_PROPS: Omit<
  ComponentProps<typeof StakingActions>,
  'delegationTokens' | 'unstakedTokens'
> = {
  amount: '',
  delegate: vi.fn(),
  undelegate: vi.fn(),
  onClickActionButton: vi.fn(),
  onClose: vi.fn(),
  setAmount: vi.fn(),
  validatorInfo,
};

describe('<StakingActions />', () => {
  it('renders an enabled Delegate button there is a non-zero balance of unstaked tokens', () => {
    const { getByText } = render(
      <StakingActions
        delegationTokens={zeroBalance}
        unstakedTokens={nonZeroBalance}
        {...BASE_PROPS}
      />,
    );

    expect(getByText('Delegate')).toBeEnabled();
  });

  it('renders an enabled Undelegate button when there is a non-zero balance of delegation tokens', () => {
    const { getByText } = render(
      <StakingActions
        delegationTokens={nonZeroBalance}
        unstakedTokens={zeroBalance}
        {...BASE_PROPS}
      />,
    );

    expect(getByText('Undelegate')).toBeEnabled();
  });

  it('renders a disabled Delegate button when there is a zero balance of unstaked tokens', () => {
    const { getByText } = render(
      <StakingActions
        delegationTokens={nonZeroBalance}
        unstakedTokens={zeroBalance}
        {...BASE_PROPS}
      />,
    );

    expect(getByText('Delegate')).toBeDisabled();
  });

  it('renders a disabled Delegate button when unstaked tokens are undefined', () => {
    const { getByText } = render(
      <StakingActions
        delegationTokens={nonZeroBalance}
        unstakedTokens={undefined}
        {...BASE_PROPS}
      />,
    );

    expect(getByText('Delegate')).toBeDisabled();
  });

  it('renders a disabled Undelegate button when there is a zero balance of delegation tokens', () => {
    const { getByText } = render(
      <StakingActions
        delegationTokens={zeroBalance}
        unstakedTokens={nonZeroBalance}
        {...BASE_PROPS}
      />,
    );

    expect(getByText('Undelegate')).toBeDisabled();
  });
});
