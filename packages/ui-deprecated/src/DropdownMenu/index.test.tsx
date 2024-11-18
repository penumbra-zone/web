import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DropdownMenu } from '.';
import { PenumbraUIProvider } from '../PenumbraUIProvider';

describe('<DropdownMenu />', () => {
  it('opens initially if `isOpen` is passed', () => {
    const { queryByText } = render(
      <DropdownMenu isOpen>
        <DropdownMenu.Trigger>
          <button type='button'>Trigger</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>Content</DropdownMenu.Content>
      </DropdownMenu>,
      { wrapper: PenumbraUIProvider },
    );

    expect(queryByText('Content')).toBeTruthy();
  });

  it('correctly selects radio item from the radio group', () => {
    const onChange = vi.fn();

    const { getByText } = render(
      <DropdownMenu isOpen>
        <DropdownMenu.Trigger>
          <button type='button'>Trigger</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup value={'1'} onChange={onChange}>
            <DropdownMenu.RadioItem value='1'>Item 1</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value='2'>Item 2</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>,
      { wrapper: PenumbraUIProvider },
    );

    fireEvent.click(getByText('Item 2'));

    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('correctly selects a checkbox item from the dropdown menu', () => {
    const onChange = vi.fn();

    const { getByText } = render(
      <DropdownMenu isOpen>
        <DropdownMenu.Trigger>
          <button type='button'>Trigger</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem onChange={onChange}>Item</DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>,
      { wrapper: PenumbraUIProvider },
    );

    fireEvent.click(getByText('Item'));

    expect(onChange).toHaveBeenCalled();
  });

  it('correctly selects a menu item from the dropdown menu', () => {
    const onChange = vi.fn();

    const { getByText } = render(
      <DropdownMenu isOpen>
        <DropdownMenu.Trigger>
          <button type='button'>Trigger</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={onChange}>Item</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
      { wrapper: PenumbraUIProvider },
    );

    fireEvent.click(getByText('Item'));

    expect(onChange).toHaveBeenCalled();
  });
});
