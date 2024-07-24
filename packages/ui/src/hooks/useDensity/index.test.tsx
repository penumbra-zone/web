import { describe, expect, it } from 'vitest';
import { useDensity } from '.';
import { render } from '@testing-library/react';
import { DensityContext } from '../../DensityContext';
import { Density } from '../../types/Density';

const MockUseDensityConsumerComponent = ({ density }: { density?: Density }) => {
  density = useDensity(density);

  return <>{density}</>;
};

describe('useDensity()', () => {
  describe('when passed a density value', () => {
    it('simply returns the passed-in value', () => {
      const { container } = render(<MockUseDensityConsumerComponent density='compact' />);

      expect(container).toHaveTextContent('compact');
    });

    it('ignores a differing context value', () => {
      const { container } = render(
        <DensityContext.Provider value='compact'>
          <MockUseDensityConsumerComponent density='sparse' />
        </DensityContext.Provider>,
      );

      expect(container).toHaveTextContent('sparse');
    });
  });

  describe('when not passed a density value', () => {
    it('returns the context value when it is `compact`', () => {
      const { container } = render(
        <DensityContext.Provider value='compact'>
          <MockUseDensityConsumerComponent />
        </DensityContext.Provider>,
      );

      expect(container).toHaveTextContent('compact');
    });

    it('returns the context value when it is `sparse`', () => {
      const { container } = render(
        <DensityContext.Provider value='sparse'>
          <MockUseDensityConsumerComponent />
        </DensityContext.Provider>,
      );

      expect(container).toHaveTextContent('sparse');
    });

    it('returns the default context value when no context exists', () => {
      const { container } = render(<MockUseDensityConsumerComponent />);

      expect(container).toHaveTextContent('sparse');
    });
  });
});
