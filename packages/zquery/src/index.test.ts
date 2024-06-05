import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UseStore, createZQuery } from '.';

describe('createZQuery()', () => {
  type MockState = null;
  let mockUseStore: UseStore<MockState>;
  let mockState: MockState;

  beforeEach(() => {
    mockState = null;
    mockUseStore = Object.assign(<T>(selector: (state: MockState) => T) => selector(mockState), {
      getState: () => mockState,
    });
  });

  describe('the return value', () => {
    const result = createZQuery(
      'puppyPhotos',
      () => Promise.resolve(null),
      () => mockUseStore,
      () => {
        /* no-op */
      },
      () => ({
        _zQueryInternal: {
          fetch: vi.fn(),
        },
        loading: false,
        revalidate: vi.fn(),
        data: undefined,
        error: undefined,
      }),
    );

    it('includes hooks and a Zustand slice that use the passed-in name', () => {
      expect(result).toHaveProperty('puppyPhotos');
      expect(result.usePuppyPhotos).toBeTypeOf('function');
      expect(result.useRevalidatePuppyPhotos).toBeTypeOf('function');
    });

    it('includes the correct default state', () => {
      expect(result.puppyPhotos).toEqual({
        data: undefined,
        error: undefined,
        loading: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        revalidate: expect.any(Function),
        _zQueryInternal: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          fetch: expect.any(Function),
        },
      });
    });
  });
});
