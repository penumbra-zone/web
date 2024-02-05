import {
  Address,
  AddressIndex,
  AddressView,
  AddressView_Decoded,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { AddressViewComponent } from './address-view';
import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';

const addressViewWithOneTimeAddress = new AddressView({
  addressView: {
    case: 'decoded',

    value: new AddressView_Decoded({
      address: new Address(),
      index: new AddressIndex({
        account: 0,
        // A one-time address is defined by a randomizer with at least one
        // non-zero byte.
        randomizer: new Uint8Array([1, 2, 3]),
      }),
    }),
  },
});

const addressViewWithNormalAddress = new AddressView({
  addressView: {
    case: 'decoded',

    value: new AddressView_Decoded({
      address: new Address(),
      index: new AddressIndex({
        account: 0,
        randomizer: new Uint8Array([0, 0, 0]),
      }),
    }),
  },
});

describe('<AddressViewComponent />', () => {
  describe('when `copyable` is `true`', () => {
    test('does not show the copy icon when the address is a one-time address', () => {
      const { queryByTestId } = render(
        <AddressViewComponent view={addressViewWithOneTimeAddress} copyable />,
      );

      expect(queryByTestId('CopyToClipboardIconButton__icon')).toBeNull();
    });

    test('shows the copy icon when the address is not a one-time address', () => {
      const { queryByTestId } = render(
        <AddressViewComponent view={addressViewWithNormalAddress} copyable />,
      );

      expect(queryByTestId('CopyToClipboardIconButton__icon')).not.toBeNull();
    });
  });

  describe('when `copyable` is `false`', () => {
    test('does not show the copy icon when the address is a one-time address', () => {
      const { queryByTestId } = render(
        <AddressViewComponent view={addressViewWithOneTimeAddress} copyable={false} />,
      );

      expect(queryByTestId('CopyToClipboardIconButton__icon')).toBeNull();
    });

    test('does not show the copy icon when the address is not a one-time address', () => {
      const { queryByTestId } = render(
        <AddressViewComponent view={addressViewWithNormalAddress} copyable={false} />,
      );

      expect(queryByTestId('CopyToClipboardIconButton__icon')).toBeNull();
    });
  });
});
