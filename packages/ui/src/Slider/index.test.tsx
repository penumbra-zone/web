import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Slider } from '.';
import { PenumbraUIProvider } from '../PenumbraUIProvider';

describe('<Slider />', () => {
  it('renders correctly', () => {
    const { container } = render(
      <Slider min={0} max={10} step={1} defaultValue={5} leftLabel='left' rightLabel='right' />,
      {
        wrapper: PenumbraUIProvider,
      },
    );

    expect(container).toHaveTextContent('left');
    expect(container).toHaveTextContent('right');
  });
});
