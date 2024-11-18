import { describe, expect, it } from 'vitest';
import { WalletBalance } from '.';
import { render } from '@testing-library/react';
import { PenumbraUIProvider } from '../PenumbraUIProvider';
import { PENUMBRA_BALANCE } from '../utils/bufs';

describe('<WalletBalance />', () => {
  it('correctly extracts the account index from `balance` prop', () => {
    const { getByRole } = render(<WalletBalance balance={PENUMBRA_BALANCE} />, {
      wrapper: PenumbraUIProvider,
    });

    const button = getByRole('button');
    expect(button).toHaveTextContent('0');
  });

  it('correctly extracts and formats the value from `balance` prop', () => {
    const { container } = render(<WalletBalance balance={PENUMBRA_BALANCE} />, {
      wrapper: PenumbraUIProvider,
    });

    expect(container).toHaveTextContent('123,456.789 UM');
  });
});
