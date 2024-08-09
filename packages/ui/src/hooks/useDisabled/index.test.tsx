import { describe, expect, it } from 'vitest';
import { useDisabled } from '.';
import { render } from '@testing-library/react';
import { DisabledContext } from '../../utils/DisabledContext';

const MockUseDisabledComponent = ({ disabled }: { disabled?: boolean }) => {
  disabled = useDisabled(disabled);

  return <>{disabled.toString()}</>;
};

describe('useDisabled()', () => {
  it('is disabled when passed `disabled`', () => {
    const { container } = render(<MockUseDisabledComponent disabled />);

    expect(container).toHaveTextContent('true');
  });

  it('is disabled when `disabled` is `false` but there is a `<DisabledContext />` wrapper', () => {
    const { container } = render(
      <DisabledContext.Provider value={true}>
        <MockUseDisabledComponent disabled={false} />
      </DisabledContext.Provider>,
    );

    expect(container).toHaveTextContent('true');
  });

  it('is disabled when `disabled` is undefined but there is a `<DisabledContext />` wrapper', () => {
    const { container } = render(
      <DisabledContext.Provider value={true}>
        <MockUseDisabledComponent />
      </DisabledContext.Provider>,
    );

    expect(container).toHaveTextContent('true');
  });

  it('is disabled when `disabled` is `true` and the `<DisabledContext />` wrapper is set to `false`', () => {
    const { container } = render(
      <DisabledContext.Provider value={false}>
        <MockUseDisabledComponent disabled={true} />
      </DisabledContext.Provider>,
    );

    expect(container).toHaveTextContent('true');
  });

  it("is not disabled when `disabled` is undefined and there's no `<DisabledContext />` wrapper", () => {
    const { container } = render(<MockUseDisabledComponent />);

    expect(container).toHaveTextContent('false');
  });

  it('is not disabled when `disabled` is undefined and the `<DisabledContext />` wrapper is set to `false`', () => {
    const { container } = render(
      <DisabledContext.Provider value={false}>
        <MockUseDisabledComponent />
      </DisabledContext.Provider>,
    );

    expect(container).toHaveTextContent('false');
  });

  it('is not disabled when `disabled` is false and the `<DisabledContext />` wrapper is set to `false`', () => {
    const { container } = render(
      <DisabledContext.Provider value={false}>
        <MockUseDisabledComponent disabled={false} />
      </DisabledContext.Provider>,
    );

    expect(container).toHaveTextContent('false');
  });
});
