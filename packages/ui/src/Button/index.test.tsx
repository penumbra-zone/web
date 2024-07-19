import { describe, expect, it, vi } from 'vitest';
import { Button } from '.';
import { fireEvent, render } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';
import { Check } from 'lucide-react';

describe('<Button />', () => {
  it('calls the passed-in click handler when clicked', () => {
    const onClick = vi.fn();
    const { getByText } = render(<Button onClick={onClick}>Click me</Button>, {
      wrapper: ThemeProvider,
    });

    fireEvent.click(getByText('Click me'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  describe('when `iconOnly` is falsey', () => {
    it('renders `children` as the button text', () => {
      const { queryByText } = render(<Button>Label</Button>, { wrapper: ThemeProvider });

      expect(queryByText('Label')).toBeTruthy();
    });
  });

  describe('when `iconOnly` is `true`', () => {
    it('renders `children` as the button label', () => {
      const { queryByText, queryByLabelText } = render(
        <Button iconOnly icon={Check}>
          Label
        </Button>,
        {
          wrapper: ThemeProvider,
        },
      );

      expect(queryByText('Label')).toBeNull();
      expect(queryByLabelText('Label')).toBeTruthy();
    });
  });
});
