import {
  AddressSchema,
  AddressIndexSchema,
  AddressViewSchema,
  AddressView_DecodedSchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

import { create } from '@bufbuild/protobuf';
import { AddressViewComponent } from '.';
import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';

const addressViewWithOneTimeAddress = create(AddressViewSchema, {
  addressView: {
    case: 'decoded',

    value: create(AddressView_DecodedSchema, {
      address: create(AddressSchema, { inner: new Uint8Array(80) }),
      index: create(AddressIndexSchema, {
        account: 0,
        // A one-time address is defined by a randomizer with at least one
        // non-zero byte.
        randomizer: new Uint8Array([1, 2, 3]),
      }),
    }),
  },
});

const addressViewWithNormalAddress = create(AddressViewSchema, {
  addressView: {
    case: 'decoded',

    value: create(AddressView_DecodedSchema, {
      address: create(AddressSchema, { inner: new Uint8Array(80) }),
      index: create(AddressIndexSchema, {
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
