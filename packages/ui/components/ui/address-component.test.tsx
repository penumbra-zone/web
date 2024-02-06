import { AddressComponent } from './address-component';
import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { bech32ToUint8Array, shortenAddress } from '@penumbra-zone/types';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';

describe('<AddressComponent />', () => {
  const address =
    'penumbra1u7dk4qw6fz3vlwyjl88vlj6gqv4hcmz2vesm87t7rm0lvwmgqqkrp3zrdmfg6et86ggv4nwmnc8vy39uxyacwm8g7trk77ad0c8n4qt76ncvuukx6xlj8mskhyjpn4twkpwwl2';
  const pbAddress = new Address({ inner: bech32ToUint8Array(address) });

  test('renders the shortened address', () => {
    const { baseElement } = render(<AddressComponent address={pbAddress} />);

    expect(baseElement).toHaveTextContent(shortenAddress(address));
  });

  test('uses text-muted-foreground for non-ephemeral addresses', () => {
    const { getByText } = render(<AddressComponent address={pbAddress} />);

    expect(getByText(shortenAddress(address))).toHaveClass('text-muted-foreground');
  });

  test('uses colored text for ephemeral addresses', () => {
    const { getByText } = render(<AddressComponent address={pbAddress} ephemeral />);

    expect(getByText(shortenAddress(address))).toHaveClass('text-[#8D5728]');
  });
});
