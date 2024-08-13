import { AddressComponent } from './address-component';
import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

describe('<AddressComponent />', () => {
  const address =
    'penumbra1u7dk4qw6fz3vlwyjl88vlj6gqv4hcmz2vesm87t7rm0lvwmgqqkrp3zrdmfg6et86ggv4nwmnc8vy39uxyacwm8g7trk77ad0c8n4qt76ncvuukx6xlj8mskhyjpn4twkpwwl2';
  const pbAddress = new Address(addressFromBech32m(address));

  test('renders the address', () => {
    const { baseElement } = render(<AddressComponent address={pbAddress} />);

    expect(baseElement).toHaveTextContent(address);
  });

  test('uses text-muted-foreground for non-ephemeral addresses', () => {
    const { getByText } = render(<AddressComponent address={pbAddress} />);

    expect(getByText(address)).toHaveClass('text-muted-foreground');
  });

  test('uses colored text for ephemeral addresses', () => {
    const { getByText } = render(<AddressComponent address={pbAddress} ephemeral />);

    expect(getByText(address)).toHaveClass('text-rust');
  });
});
