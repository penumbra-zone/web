import { render, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from '.';

window.ResizeObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

describe('<Slider />', () => {
  it('renders correctly', () => {
    const { container } = render(
      <Slider min={0} max={10} step={1} defaultValue={5} leftLabel='left' rightLabel='right' />,
    );

    expect(container).toHaveTextContent('left');
    expect(container).toHaveTextContent('right');
  });

  it('handles onChange correctly', () => {
    const onChange = vi.fn();

    const { container } = render(
      <Slider min={0} max={10} step={1} defaultValue={5} onChange={onChange} />,
    );

    const slider = container.querySelector('[role="slider"]')!;
    fireEvent.focus(slider);
    fireEvent.keyDown(slider, { key: 'ArrowRight' });

    expect(onChange).toHaveBeenCalledWith(6);
  });
});
