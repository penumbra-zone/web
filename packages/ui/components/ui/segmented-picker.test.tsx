import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { SegmentedPicker } from './segmented-picker';

describe('<SegmentedPicker />', () => {
  const onClick = vi.fn();

  beforeEach(() => {
    onClick.mockReset();
  });

  it('renders all passed-in options', () => {
    const options = [
      { value: 'one', label: 'One', onClick },
      { value: 'two', label: 'Two', onClick },
      { value: 'three', label: 'Three', onClick },
    ];

    const { container } = render(<SegmentedPicker value='one' options={options} />);

    expect(container).toHaveTextContent('One');
    expect(container).toHaveTextContent('Two');
    expect(container).toHaveTextContent('Three');
  });

  it('calls the `onClick` handler with the value of the clicked option', () => {
    const options = [
      { value: 'one', label: 'One', onClick },
      { value: 'two', label: 'Two', onClick },
      { value: 'three', label: 'Three', onClick },
    ];

    const { getByText } = render(<SegmentedPicker value='one' options={options} />);
    fireEvent.click(getByText('Two'));

    expect(onClick).toHaveBeenCalledWith('two');
  });
});
