import { describe, expect, it, vi } from 'vitest';
import { AccountSwitcher } from './account-switcher';
import { fireEvent, render } from '@testing-library/react';

describe('<AccountSwitcher />', () => {
  it('renders the current account', () => {
    const { getByLabelText } = render(<AccountSwitcher account={123} onChange={vi.fn()} />);

    expect(getByLabelText('Account #123')).toHaveValue(123);
  });

  describe('changing the account via the input field', () => {
    it('calls `onChange` with the new value', () => {
      const onChange = vi.fn();
      const { getByLabelText } = render(<AccountSwitcher account={123} onChange={onChange} />);

      expect(onChange).not.toHaveBeenCalled();
      fireEvent.change(getByLabelText('Account #123'), { target: { value: 456 } });
      expect(onChange).toHaveBeenCalledWith(456);
    });
  });

  describe('the previous button', () => {
    it('calls `onChange` with one less than the current value', () => {
      const onChange = vi.fn();
      const { getByLabelText } = render(<AccountSwitcher account={123} onChange={onChange} />);

      expect(onChange).not.toHaveBeenCalled();
      fireEvent.click(getByLabelText('Previous account'));
      expect(onChange).toHaveBeenCalledWith(122);
    });

    it("does not render when we're at account 0", () => {
      const { queryByLabelText } = render(<AccountSwitcher account={0} onChange={vi.fn()} />);

      expect(queryByLabelText('Previous account')).toBeNull();
    });

    describe('when a filter has been passed', () => {
      it('calls `onChange` with the next lower account index in the filter', () => {
        const onChange = vi.fn();
        const { getByLabelText } = render(
          <AccountSwitcher account={123} onChange={onChange} filter={[123, 100]} />,
        );

        expect(onChange).not.toHaveBeenCalled();
        fireEvent.click(getByLabelText('Previous account'));
        expect(onChange).toHaveBeenCalledWith(100);
      });

      it("does not render when we're at the lowest account index in the filter", () => {
        const { queryByLabelText } = render(
          <AccountSwitcher account={100} onChange={vi.fn()} filter={[123, 100]} />,
        );

        expect(queryByLabelText('Previous account')).toBeNull();
      });
    });
  });

  describe('the next button', () => {
    it('calls `onChange` with one more than the current value', () => {
      const onChange = vi.fn();
      const { getByLabelText } = render(<AccountSwitcher account={123} onChange={onChange} />);

      expect(onChange).not.toHaveBeenCalled();
      fireEvent.click(getByLabelText('Next account'));
      expect(onChange).toHaveBeenCalledWith(124);
    });

    it("does not render when we're at the maximum account index", () => {
      const { queryByLabelText } = render(<AccountSwitcher account={2 ** 32} onChange={vi.fn()} />);

      expect(queryByLabelText('Next account')).toBeNull();
    });

    describe('when a filter has been passed', () => {
      it('calls `onChange` with the next higher account index in the filter', () => {
        const onChange = vi.fn();
        const { getByLabelText } = render(
          <AccountSwitcher account={100} onChange={onChange} filter={[123, 100]} />,
        );

        expect(onChange).not.toHaveBeenCalled();
        fireEvent.click(getByLabelText('Next account'));
        expect(onChange).toHaveBeenCalledWith(123);
      });

      it("does not render when we're at the highest account index in the filter", () => {
        const { queryByLabelText } = render(
          <AccountSwitcher account={123} onChange={vi.fn()} filter={[123, 100]} />,
        );

        expect(queryByLabelText('Next account')).toBeNull();
      });
    });
  });
});
