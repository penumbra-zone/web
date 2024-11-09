import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Dialog } from '.';
import { PenumbraUIProvider } from '../PenumbraUIProvider';

describe('<Dialog />', () => {
  it('renders a close button by default', () => {
    const { queryByLabelText, getByText } = render(
      <Dialog>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content title='Title'>Hello, world</Dialog.Content>
      </Dialog>,
      { wrapper: PenumbraUIProvider },
    );

    fireEvent.click(getByText('Open'));

    expect(queryByLabelText('Close')).toBeTruthy();
  });

  it('renders a close button when both `isOpen` and `onClose` are passed', () => {
    const { queryByLabelText } = render(
      <Dialog isOpen={true} onClose={() => {}}>
        <Dialog.Content title='Title'>Hello, world</Dialog.Content>
      </Dialog>,
      { wrapper: PenumbraUIProvider },
    );

    expect(queryByLabelText('Close')).toBeTruthy();
  });

  it('does not render a close button when both `isOpen` is passed but `onClose` is not', () => {
    const { queryByLabelText } = render(
      <Dialog isOpen={true}>
        <Dialog.Content title='Title'>Hello, world</Dialog.Content>
      </Dialog>,
      { wrapper: PenumbraUIProvider },
    );

    expect(queryByLabelText('Close')).toBeNull();
  });
});
