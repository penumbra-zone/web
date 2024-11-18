import { describe, expect, it, vi } from 'vitest';
import { Toggle } from '.';
import { fireEvent, render } from '@testing-library/react';
import { PenumbraUIProvider } from '../PenumbraUIProvider';

describe('<Toggle />', () => {
  it('toggles from false to true', () => {
    const onChange = vi.fn();

    const { getByLabelText } = render(<Toggle label='Toggle' value={false} onChange={onChange} />, {
      wrapper: PenumbraUIProvider,
    });

    fireEvent.click(getByLabelText('Toggle'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles from true to false', () => {
    const onChange = vi.fn();

    const { getByLabelText } = render(<Toggle label='Toggle' value={true} onChange={onChange} />, {
      wrapper: PenumbraUIProvider,
    });

    fireEvent.click(getByLabelText('Toggle'));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
