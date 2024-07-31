import { describe, expect, it, vi } from 'vitest';
import { Button } from '.';
import { fireEvent, render } from '@testing-library/react';
import { PenumbraUIProvider } from '../PenumbraUIProvider';
import { Check } from 'lucide-react';

describe('<Button />', () => {
  it('calls the passed-in click handler when clicked', () => {
    const onClick = vi.fn();
    const { getByText } = render(<Button onClick={onClick}>Click me</Button>, {
      wrapper: PenumbraUIProvider,
    });

    fireEvent.click(getByText('Click me'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  describe('when `iconOnly` is falsey', () => {
    it('renders `children` as the button text', () => {
      const { queryByText } = render(<Button>Label</Button>, { wrapper: PenumbraUIProvider });

      expect(queryByText('Label')).toBeTruthy();
    });
  });

  describe('when `iconOnly` is `true`', () => {
    it('renders `children` as the button label', () => {
      const { queryByText, queryByLabelText } = render(
        <Button iconOnly icon={Check}>
          Label
        </Button>,
        { wrapper: PenumbraUIProvider },
      );

      expect(queryByText('Label')).toBeNull();
      expect(queryByLabelText('Label')).toBeTruthy();
    });

    it('renders `children` as the `title`', () => {
      const { queryByTitle } = render(
        <Button iconOnly icon={Check}>
          Label
        </Button>,
        { wrapper: PenumbraUIProvider },
      );

      expect(queryByTitle('Label')).toBeTruthy();
    });
  });
});
