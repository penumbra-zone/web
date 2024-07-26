import { describe, expect, it } from 'vitest';
import { Pill } from '.';
import { render } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';

describe('<Pill />', () => {
  it('renders its `children`', () => {
    const { queryByText } = render(<Pill>Contents</Pill>, { wrapper: ThemeProvider });

    expect(queryByText('Contents')).toBeTruthy();
  });
});
