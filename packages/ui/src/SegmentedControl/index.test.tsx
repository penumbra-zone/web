import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { SegmentedControl } from '.';
import { PenumbraUIProvider } from '../PenumbraUIProvider';

describe('<SegmentedControl />', () => {
  const onChange = vi.fn();
  const options = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
    { value: 'three', label: 'Three' },
  ];

  beforeEach(() => {
    onChange.mockReset();
  });

  it('renders all passed-in options', () => {
    const { container } = render(
      <SegmentedControl value='one' options={options} onChange={onChange} />,
      { wrapper: PenumbraUIProvider },
    );

    expect(container).toHaveTextContent('One');
    expect(container).toHaveTextContent('Two');
    expect(container).toHaveTextContent('Three');
  });

  it('calls the `onClick` handler with the value of the clicked option', () => {
    const { getByText } = render(
      <SegmentedControl value='one' options={options} onChange={onChange} />,
      { wrapper: PenumbraUIProvider },
    );
    fireEvent.click(getByText('Two', { selector: ':not([aria-hidden])' }));

    expect(onChange).toHaveBeenCalledWith('two');
  });
});
