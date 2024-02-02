import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { SegmentedPicker } from './segmented-picker';

describe('<SegmentedPicker />', () => {
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
      <SegmentedPicker value='one' options={options} onChange={onChange} />,
    );

    expect(container).toHaveTextContent('One');
    expect(container).toHaveTextContent('Two');
    expect(container).toHaveTextContent('Three');
  });

  it('calls the `onClick` handler with the value of the clicked option', () => {
    const { getByText } = render(
      <SegmentedPicker value='one' options={options} onChange={onChange} />,
    );
    fireEvent.click(getByText('Two'));

    expect(onChange).toHaveBeenCalledWith('two');
  });
});
