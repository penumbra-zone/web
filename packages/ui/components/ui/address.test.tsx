import { Address } from './address';
import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { shortenAddress } from '@penumbra-zone/types';

describe('<Address />', () => {
  const address =
    'penumbra1nzxd3wqautgr8hmwwvvgwnsgtpnl3rexwyj0srpcyaf75968mq3wseftwzwcsx458la09m3am7x2qlk7jfchuvpv6uvw79ctzpnrt7c2wd6n9j9xgk8regdwkrjple9uh2tekf';

  test('renders the shortened address', () => {
    const { baseElement } = render(<Address address={address} />);

    expect(baseElement).toHaveTextContent(shortenAddress(address));
  });

  test('uses text-muted-foreground for non-ephemeral addresses', () => {
    const { getByText } = render(<Address address={address} />);

    expect(getByText(shortenAddress(address))).toHaveClass('text-muted-foreground');
  });

  test('uses colored text for ephemeral addresses', () => {
    const { getByText } = render(<Address address={address} ephemeral />);

    expect(getByText(shortenAddress(address))).toHaveClass('text-[#8D5728]');
  });
});
