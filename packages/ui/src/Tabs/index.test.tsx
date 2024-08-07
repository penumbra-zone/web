import { describe, expect, it, vi } from 'vitest';
import { Tabs } from '.';
import { fireEvent, render } from '@testing-library/react';
import { PenumbraUIProvider } from '../PenumbraUIProvider';

describe('<Tabs />', () => {
  it('renders a button for each of the `options`', () => {
    const { queryByText } = render(
      <Tabs
        value='one'
        options={[
          { label: 'One', value: 'one' },
          { label: 'Two', value: 'two' },
        ]}
        onChange={vi.fn()}
      />,
      { wrapper: PenumbraUIProvider },
    );

    expect(queryByText('One')).toBeTruthy();
    expect(queryByText('Two')).toBeTruthy();
  });

  it("calls the `onChange` handler with the clicked option's value when clicked", () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <Tabs
        value='one'
        options={[
          { label: 'One', value: 'one' },
          { label: 'Two', value: 'two' },
        ]}
        onChange={onChange}
      />,
      { wrapper: PenumbraUIProvider },
    );

    fireEvent.click(getByText('Two'));

    expect(onChange).toHaveBeenCalledWith('two');
  });
});
