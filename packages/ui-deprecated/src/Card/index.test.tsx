import { describe, expect, it } from 'vitest';
import { Card } from '.';
import { render } from '@testing-library/react';
import { PenumbraUIProvider } from '../PenumbraUIProvider';

describe('<Card />', () => {
  it('renders the title', () => {
    const { container } = render(<Card title='Title here'>Content here</Card>, {
      wrapper: PenumbraUIProvider,
    });

    expect(container).toHaveTextContent('Title here');
  });

  it('renders the content', () => {
    const { container } = render(<Card title='Title here'>Content here</Card>, {
      wrapper: PenumbraUIProvider,
    });

    expect(container).toHaveTextContent('Content here');
  });
});
