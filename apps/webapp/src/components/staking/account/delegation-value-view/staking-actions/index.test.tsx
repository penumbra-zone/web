import { describe, expect, it } from 'vitest';
import { StakingActions } from '.';
import { render } from '@testing-library/react';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';

describe('<StakingActions />', () => {
  it('renders an enabled Delegate button when `canDelegate` is `true`', () => {
    const { getByText } = render(
      <StakingActions canDelegate canUndelegate validatorInfo={new ValidatorInfo()} />,
    );

    expect(getByText('Delegate')).toBeEnabled();
  });

  it('renders an enabled Undelegate button when `canUndelegate` is `true`', () => {
    const { getByText } = render(
      <StakingActions canDelegate canUndelegate validatorInfo={new ValidatorInfo()} />,
    );

    expect(getByText('Undelegate')).toBeEnabled();
  });

  it('renders a disabled Delegate button when `canDelegate` is `false`', () => {
    const { getByText } = render(
      <StakingActions canDelegate={false} canUndelegate validatorInfo={new ValidatorInfo()} />,
    );

    expect(getByText('Delegate')).toBeDisabled();
  });

  it('renders a disabled Undelegate button when `canUndelegate` is `false`', () => {
    const { getByText } = render(
      <StakingActions canDelegate canUndelegate={false} validatorInfo={new ValidatorInfo()} />,
    );

    expect(getByText('Undelegate')).toBeDisabled();
  });
});
