import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Popover } from '.';
import { PenumbraUIProvider } from '../PenumbraUIProvider';

describe('<Popover />', () => {
  it('opens when trigger is clicked', () => {
    const { getByText, queryByText } = render(
      <Popover>
        <Popover.Trigger>Trigger</Popover.Trigger>
        <Popover.Content>Content</Popover.Content>
      </Popover>,
      { wrapper: PenumbraUIProvider },
    );

    expect(queryByText('Content')).toBeFalsy();
    fireEvent.click(getByText('Trigger'));
    expect(queryByText('Content')).toBeTruthy();
  });

  it('opens initially if `isOpen` is passed', () => {
    const { queryByText } = render(
      <Popover isOpen>
        <Popover.Trigger>Trigger</Popover.Trigger>
        <Popover.Content>Content</Popover.Content>
      </Popover>,
      { wrapper: PenumbraUIProvider },
    );

    expect(queryByText('Content')).toBeTruthy();
  });
});
