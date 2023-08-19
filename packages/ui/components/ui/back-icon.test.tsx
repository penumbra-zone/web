import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { BackIcon } from './back-icon';

describe('<BackIcon />', () => {
  test.skip('renders correctly', () => {
    const { asFragment } = render(<BackIcon />);
    expect(asFragment()).toMatchSnapshot();
  });
});
