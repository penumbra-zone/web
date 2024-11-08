import { describe, expect, it } from 'vitest';
import { TextInput } from '.';
import { render } from '@testing-library/react';
import { PenumbraUIProvider } from '../PenumbraUIProvider';

describe('<TextInput />', () => {
  it('renders the passed-in `startAdornment`', () => {
    const { container } = render(
      <TextInput value='' onChange={() => {}} startAdornment='Start adornment' />,
      { wrapper: PenumbraUIProvider },
    );

    expect(container).toHaveTextContent('Start adornment');
  });

  it('renders the passed-in `endAdornment`', () => {
    const { container } = render(
      <TextInput value='' onChange={() => {}} endAdornment='End adornment' />,
      { wrapper: PenumbraUIProvider },
    );

    expect(container).toHaveTextContent('End adornment');
  });
});
