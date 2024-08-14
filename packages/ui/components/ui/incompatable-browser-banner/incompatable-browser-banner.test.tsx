import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { IncompatableBrowserBanner } from '.';

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

describe('<IncompatableBrowserBanner />', () => {
  it('shouldn’t render when using a compatable browser & device', () => {
    const { container } = render(<IncompatableBrowserBanner />);
    expect(container.firstChild).toBe(null);
  });

  it('renders "Incompatable Browser Detected" when not using Chrome', () => {
    const { container } = render(<IncompatableBrowserBanner />);
    expect(container).toHaveTextContent('Incompatable Browser Detected');
  });

  it('renders "Incompatable Browser Detected" when using a dated version of Chrome', () => {
    const { container } = render(<IncompatableBrowserBanner />);
    expect(container).toHaveTextContent('Incompatable Browser Detected');
  });

  it('renders "Incompatable Device Detected" when using a mobile device', () => {
    const { container } = render(<IncompatableBrowserBanner />);
    expect(container).toHaveTextContent('Incompatable Device Detected');
  });
});
