import { describe, expect, it } from 'vitest';
import { Pill } from '.';
import { render } from '@testing-library/react';
import { PenumbraUIProvider } from '../PenumbraUIProvider';

describe('<Pill />', () => {
  it('renders its `children`', () => {
    const { queryByText } = render(<Pill>Contents</Pill>, { wrapper: PenumbraUIProvider });

    expect(queryByText('Contents')).toBeTruthy();
  });
});
