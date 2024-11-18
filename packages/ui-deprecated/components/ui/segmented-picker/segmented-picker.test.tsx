import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { SegmentedPicker } from '.';

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
    fireEvent.click(getByText('Two', { selector: ':not([aria-hidden])' }));

    expect(onChange).toHaveBeenCalledWith('two');
  });

  it('applies aria-checked=true to the selected option', () => {
    const { getByText } = render(
      <SegmentedPicker value='one' options={options} onChange={onChange} />,
    );

    expect(getByText('One', { selector: ':not([aria-hidden])' }).parentElement).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(getByText('Two', { selector: ':not([aria-hidden])' }).parentElement).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(getByText('Three', { selector: ':not([aria-hidden])' }).parentElement).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });
});
