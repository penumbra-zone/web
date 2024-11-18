import { beforeAll, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { CopyToClipboardButton } from '.';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { PenumbraUIProvider } from '../PenumbraUIProvider';

describe('<CopyToClipboardButton />', () => {
  beforeAll(() => {
    userEvent.setup();
  });

  it('copies the value of the `text` prop to the clipboard', async () => {
    const { getByLabelText } = render(<CopyToClipboardButton text='copy that' />, {
      wrapper: PenumbraUIProvider,
    });

    fireEvent.click(getByLabelText('Copy'));

    const clipboardText = await navigator.clipboard.readText();

    expect(clipboardText).toBe('copy that');
  });

  it('has an initial label of "Copy"', () => {
    const { queryByLabelText } = render(<CopyToClipboardButton text='copy that' />, {
      wrapper: PenumbraUIProvider,
    });

    expect(queryByLabelText('Copy')).toBeTruthy();
  });

  it('changes the label to "Copied" after the user clicks it', async () => {
    const { getByLabelText, queryByLabelText } = render(
      <CopyToClipboardButton text='copy that' />,
      {
        wrapper: PenumbraUIProvider,
      },
    );

    fireEvent.click(getByLabelText('Copy'));

    await waitFor(() => expect(queryByLabelText('Copied')).toBeTruthy());
  });
});
