import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TestnetBanner } from './testnet-banner';

describe('<TestnetBanner />', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockReset();
  });

  it('renders banner if chainId is a testnet', () => {
    const { container } = render(<TestnetBanner chainId='penumbra-testnet-deimos-7' />);

    expect(container).toHaveTextContent('penumbra-testnet-deimos-7');
    expect(container).toHaveTextContent('Testnet tokens have no monetary value.');
  });

  it('does not render banner if chainId is not a testnet', () => {
    const { container } = render(<TestnetBanner chainId='any-other-name' />);
    expect(container).not.toHaveTextContent('any-other-name');
    expect(container).not.toHaveTextContent('Testnet tokens have no monetary value.');
  });

  it('does not render banner if chainId is missing', () => {
    const { container } = render(<TestnetBanner chainId={undefined} />);
    expect(container).not.toHaveTextContent('any-other-name');
    expect(container).not.toHaveTextContent('Testnet tokens have no monetary value.');
  });
});
