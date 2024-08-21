import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { IncompatibleBrowserBanner } from '.';

vi.mock('ua-parser-js', () => ({
  UAParser: vi.fn().mockImplementation(() => ({
    getBrowser: vi
      .fn()
      .mockImplementationOnce(() => ({
        name: 'Chrome',
        version: 120,
      }))
      .mockImplementationOnce(() => ({
        name: 'Mises',
        version: 12,
      }))
      .mockImplementationOnce(() => ({
        name: 'Chrome',
        version: 100,
      }))
      .mockImplementationOnce(() => ({
        name: 'Chrome',
        version: 999,
      })),
    getDevice: vi
      .fn()
      .mockImplementationOnce(() => ({
        type: 'desktop',
      }))
      .mockImplementationOnce(() => ({
        type: 'desktop',
      }))
      .mockImplementationOnce(() => ({
        type: 'desktop',
      }))
      .mockImplementationOnce(() => ({
        type: 'mobile',
      })),
  })),
}));

describe('<IncompatibleBrowserBanner />', () => {
  it('shouldn’t render when using a compatible browser & device', () => {
    const { container } = render(<IncompatibleBrowserBanner />);
    expect(container.firstChild).toBe(null);
  });

  it('renders "Incompatible Browser Detected" when not using Chrome', () => {
    const { container } = render(<IncompatibleBrowserBanner />);
    expect(container).toHaveTextContent('Incompatible Browser Detected');
  });

  it('renders "Incompatible Browser Detected" when using a dated version of Chrome', () => {
    const { container } = render(<IncompatibleBrowserBanner />);
    expect(container).toHaveTextContent('Incompatible Browser Detected');
  });

  it('renders "Incompatible Device Detected" when using a mobile device', () => {
    const { container } = render(<IncompatibleBrowserBanner />);
    expect(container).toHaveTextContent('Incompatible Device Detected');
  });
});
