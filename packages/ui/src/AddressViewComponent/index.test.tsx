import {
  Address,
  AddressIndex,
  AddressView,
  AddressView_Decoded,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import { AddressViewComponent } from '.';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { PenumbraUIProvider } from '../PenumbraUIProvider';

const addressViewWithOneTimeAddress = new AddressView({
  addressView: {
    case: 'decoded',

    value: new AddressView_Decoded({
      address: new Address({ inner: new Uint8Array(80) }),
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
      address: new Address({ inner: new Uint8Array(80) }),
      index: new AddressIndex({
        account: 0,
        randomizer: new Uint8Array([0, 0, 0]),
      }),
    }),
  },
});

describe('<AddressViewComponent />', () => {
  describe('when `copyable` is `true`', () => {
    it('does not show the copy icon when the address is a one-time address', () => {
      const { queryByLabelText } = render(
        <AddressViewComponent addressView={addressViewWithOneTimeAddress} copyable />,
        { wrapper: PenumbraUIProvider },
      );

      expect(queryByLabelText('Copy')).toBeNull();
    });

    it('shows the copy icon when the address is not a one-time address', () => {
      const { queryByLabelText } = render(
        <AddressViewComponent addressView={addressViewWithNormalAddress} copyable />,
        { wrapper: PenumbraUIProvider },
      );

      expect(queryByLabelText('Copy')).not.toBeNull();
    });
  });

  describe('when `copyable` is `false`', () => {
    it('does not show the copy icon when the address is a one-time address', () => {
      const { queryByLabelText } = render(
        <AddressViewComponent addressView={addressViewWithOneTimeAddress} copyable={false} />,
        { wrapper: PenumbraUIProvider },
      );

      expect(queryByLabelText('Copy')).toBeNull();
    });

    it('does not show the copy icon when the address is not a one-time address', () => {
      const { queryByLabelText } = render(
        <AddressViewComponent addressView={addressViewWithNormalAddress} copyable={false} />,
        { wrapper: PenumbraUIProvider },
      );

      expect(queryByLabelText('Copy')).toBeNull();
    });
  });
});
