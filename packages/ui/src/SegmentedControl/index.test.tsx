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

  describe('when the options have non-string values', () => {
    const valueOne = { toString: () => 'one' };
    const valueTwo = { toString: () => 'two' };
    const valueThree = { toString: () => 'three' };

    const options = [
      { value: valueOne, label: 'One' },
      { value: valueTwo, label: 'Two' },
      { value: valueThree, label: 'Three' },
    ];

    it('calls the `onClick` handler with the value of the clicked option', () => {
      const { getByText } = render(
        <SegmentedControl value={valueOne} options={options} onChange={onChange} />,
        { wrapper: PenumbraUIProvider },
      );
      fireEvent.click(getByText('Two', { selector: ':not([aria-hidden])' }));

      expect(onChange).toHaveBeenCalledWith(valueTwo);
    });

    describe("when the options' `.toString()` methods return non-unique values", () => {
      const valueOne = { toString: () => 'one' };
      const valueTwo = { toString: () => 'two' };
      const valueTwoAgain = { toString: () => 'two' };

      const options = [
        { value: valueOne, label: 'One' },
        { value: valueTwo, label: 'Two' },
        { value: valueTwoAgain, label: 'Two again' },
      ];

      it('throws', () => {
        expect(() =>
          render(<SegmentedControl value={valueOne} options={options} onChange={onChange} />, {
            wrapper: PenumbraUIProvider,
          }),
        ).toThrow('The value options passed to `<SegmentedControl />` are not unique.');
      });
    });
  });
});
