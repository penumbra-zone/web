import { AddressViewComponent } from '.';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { PenumbraUIProvider } from '../PenumbraUIProvider';
import { ADDRESS_VIEW_DECODED_ONE_TIME, ADDRESS_VIEW_DECODED } from '../utils/bufs';

describe('<AddressViewComponent />', () => {
  describe('when `copyable` is `true`', () => {
    it('does not show the copy icon when the address is a one-time address', () => {
      const { queryByLabelText } = render(
        <AddressViewComponent addressView={ADDRESS_VIEW_DECODED_ONE_TIME} copyable />,
        { wrapper: PenumbraUIProvider },
      );

      expect(queryByLabelText('Copy')).toBeNull();
    });

    it('shows the copy icon when the address is not a one-time address', () => {
      const { queryByLabelText } = render(
        <AddressViewComponent addressView={ADDRESS_VIEW_DECODED} copyable />,
        { wrapper: PenumbraUIProvider },
      );

      expect(queryByLabelText('Copy')).not.toBeNull();
    });
  });

  describe('when `copyable` is `false`', () => {
    it('does not show the copy icon when the address is a one-time address', () => {
      const { queryByLabelText } = render(
        <AddressViewComponent addressView={ADDRESS_VIEW_DECODED_ONE_TIME} copyable={false} />,
        { wrapper: PenumbraUIProvider },
      );

      expect(queryByLabelText('Copy')).toBeNull();
    });

    it('does not show the copy icon when the address is not a one-time address', () => {
      const { queryByLabelText } = render(
        <AddressViewComponent addressView={ADDRESS_VIEW_DECODED} copyable={false} />,
        { wrapper: PenumbraUIProvider },
      );

      expect(queryByLabelText('Copy')).toBeNull();
    });
  });
});
