import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Banner } from '.';

describe('<Banner />', () => {
  it('renders banner with correct title & content', () => {
    const { container } = render(<Banner type="success" title='Shield' content='activated' />);

    expect(container).toHaveTextContent('Shield');
    expect(container).toHaveTextContent('activated');
  });
});
