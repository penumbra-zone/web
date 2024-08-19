import { describe, expect, it } from 'vitest';
import { useAnimationDeferredValue } from '.';
import { render } from '@testing-library/react';
import { IsAnimatingContext } from '../../utils/IsAnimatingContext';

const MockUseAnimationDeferredValueComponent = ({ children }: { children: string }) => {
  const deferredChildren = useAnimationDeferredValue(children);

  return <>{deferredChildren}</>;
};

describe('useAnimationDeferredValue()', () => {
  describe('when no parent component is animating', () => {
    it('returns the passed value', () => {
      const { container } = render(
        <IsAnimatingContext.Provider value={false}>
          <MockUseAnimationDeferredValueComponent>
            Hello, world!
          </MockUseAnimationDeferredValueComponent>
        </IsAnimatingContext.Provider>,
      );

      expect(container).toHaveTextContent('Hello, world!');
    });

    it('immediately returns an updated passed value', () => {
      const { container, rerender } = render(
        <IsAnimatingContext.Provider value={false}>
          <MockUseAnimationDeferredValueComponent>
            Hello, world!
          </MockUseAnimationDeferredValueComponent>
        </IsAnimatingContext.Provider>,
      );

      expect(container).toHaveTextContent('Hello, world!');

      rerender(
        <IsAnimatingContext.Provider value={false}>
          <MockUseAnimationDeferredValueComponent>
            'ello, poppet!
          </MockUseAnimationDeferredValueComponent>
        </IsAnimatingContext.Provider>,
      );

      expect(container).toHaveTextContent("'ello, poppet!");
    });
  });

  describe('when a parent component is animating', () => {
    it('initially returns the passed value', () => {
      const { container } = render(
        <IsAnimatingContext.Provider value={true}>
          <MockUseAnimationDeferredValueComponent>
            Hello, world!
          </MockUseAnimationDeferredValueComponent>
        </IsAnimatingContext.Provider>,
      );

      expect(container).toHaveTextContent('Hello, world!');
    });

    it('does not immediately return an updated passed value', () => {
      const { container, rerender } = render(
        <IsAnimatingContext.Provider value={true}>
          <MockUseAnimationDeferredValueComponent>
            Hello, world!
          </MockUseAnimationDeferredValueComponent>
        </IsAnimatingContext.Provider>,
      );

      expect(container).toHaveTextContent('Hello, world!');

      rerender(
        <IsAnimatingContext.Provider value={true}>
          <MockUseAnimationDeferredValueComponent>
            'ello, poppet!
          </MockUseAnimationDeferredValueComponent>
        </IsAnimatingContext.Provider>,
      );

      expect(container).toHaveTextContent('Hello, world!');
    });

    it('finally returns the updated passed value once the animation is complete', () => {
      const { container, rerender } = render(
        <IsAnimatingContext.Provider value={true}>
          <MockUseAnimationDeferredValueComponent>
            Hello, world!
          </MockUseAnimationDeferredValueComponent>
        </IsAnimatingContext.Provider>,
      );

      expect(container).toHaveTextContent('Hello, world!');

      rerender(
        <IsAnimatingContext.Provider value={true}>
          <MockUseAnimationDeferredValueComponent>
            'ello, poppet!
          </MockUseAnimationDeferredValueComponent>
        </IsAnimatingContext.Provider>,
      );

      expect(container).toHaveTextContent('Hello, world!');

      rerender(
        <IsAnimatingContext.Provider value={false}>
          <MockUseAnimationDeferredValueComponent>
            'ello, poppet!
          </MockUseAnimationDeferredValueComponent>
        </IsAnimatingContext.Provider>,
      );

      expect(container).toHaveTextContent("'ello, poppet!");
    });
  });
});
