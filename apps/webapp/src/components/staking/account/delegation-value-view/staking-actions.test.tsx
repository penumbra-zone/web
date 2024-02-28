import { describe, expect, it } from 'vitest';
import { StakingActions } from './staking-actions';
import { render } from '@testing-library/react';

describe('<StakingActions />', () => {
  it('renders an enabled Delegate button when `canDelegate` is `true`', () => {
    const { getByText } = render(<StakingActions canDelegate canUndelegate />);

    expect(getByText('Delegate')).toBeEnabled();
  });

  it('renders an enabled Undelegate button when `canUndelegate` is `true`', () => {
    const { getByText } = render(<StakingActions canDelegate canUndelegate />);

    expect(getByText('Undelegate')).toBeEnabled();
  });

  it('renders a disabled Delegate button when `canDelegate` is `false`', () => {
    const { getByText } = render(<StakingActions canDelegate={false} canUndelegate />);

    expect(getByText('Delegate')).toBeDisabled();
  });

  it('renders a disabled Undelegate button when `canUndelegate` is `false`', () => {
    const { getByText } = render(<StakingActions canDelegate canUndelegate={false} />);

    expect(getByText('Undelegate')).toBeDisabled();
  });
});
