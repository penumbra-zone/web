import {
  Address,
  AddressIndex,
  AddressView,
  AddressView_Visible,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { AddressViewComponent } from './address-view';
import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';

const addressViewWithOneTimeAddress = () =>
  new AddressView({
    addressView: {
      case: 'visible',

      value: new AddressView_Visible({
        address: new Address(),
        index: new AddressIndex({
          account: 0,
          randomizer: new Uint8Array([1, 2, 3]),
        }),
      }),
    },
  });

const addressViewWithNormalAddress = () =>
  new AddressView({
    addressView: {
      case: 'visible',

      value: new AddressView_Visible({
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
    describe('when the address is a one-time address', () => {
      test('does not show the copy icon', () => {
        const { queryByTestId } = render(
          <AddressViewComponent view={addressViewWithOneTimeAddress()} copyable />,
        );

        expect(queryByTestId('AddressView__CopyIcon')).toBeNull();
      });
    });

    describe('when the address is not a one-time address', () => {
      test('shows the copy icon', () => {
        const { queryByTestId } = render(
          <AddressViewComponent view={addressViewWithNormalAddress()} copyable />,
        );

        expect(queryByTestId('AddressView__CopyIcon')).not.toBeNull();
      });
    });
  });

  describe('when `copyable` is `false`', () => {
    describe('when the address is a one-time address', () => {
      test('does not show the copy icon', () => {
        const { queryByTestId } = render(
          <AddressViewComponent view={addressViewWithOneTimeAddress()} copyable={false} />,
        );

        expect(queryByTestId('AddressView__CopyIcon')).toBeNull();
      });
    });

    describe('when the address is not a one-time address', () => {
      test('does not show the copy icon', () => {
        const { debug, queryByTestId } = render(
          <AddressViewComponent view={addressViewWithNormalAddress()} copyable={false} />,
        );

        expect(queryByTestId('AddressView__CopyIcon')).toBeNull();
      });
    });
  });
});
