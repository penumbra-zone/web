import { describe, expect, it, vi } from 'vitest';
import { Button } from '.';
import { fireEvent, render } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';

describe('<Button />', () => {
  it('calls the passed-in click handler when clicked', () => {
    const onClick = vi.fn();
    const { getByText } = render(<Button onClick={onClick}>Click me</Button>, {
      wrapper: ThemeProvider,
    });

    fireEvent.click(getByText('Click me'));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
