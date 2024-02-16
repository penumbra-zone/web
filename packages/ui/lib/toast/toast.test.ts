import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast } from './toast';

const TOAST_FN_PROPERTIES = vi.hoisted(
  () => ['success', 'info', 'warning', 'error', 'message', 'dismiss', 'loading'] as const,
);

const MOCK_TOAST_ID = vi.hoisted(() => 1);

type MockWithToastFnProperties = Mock & Record<(typeof TOAST_FN_PROPERTIES)[number], Mock>;

const mockToastFn = vi.hoisted<MockWithToastFnProperties>(() => {
  const mock = vi.fn().mockReturnValue(1) as MockWithToastFnProperties;
  TOAST_FN_PROPERTIES.forEach(
    property => (mock[property] = vi.fn().mockReturnValue(MOCK_TOAST_ID)),
  );

  return mock;
});

vi.mock('sonner', async () => ({
  ...(await vi.importActual('sonner')),
  toast: mockToastFn,
}));

describe('Toast', () => {
  beforeEach(() => {
    mockToastFn.mockClear();
    TOAST_FN_PROPERTIES.forEach(property => mockToastFn[property].mockClear());
  });

  it('does not show the toast until .show() is called', () => {
    const toast = new Toast().message('Hello, world!').description('Description here');

    expect(mockToastFn).not.toHaveBeenCalled();
    toast.show();
    expect(mockToastFn).toHaveBeenCalledTimes(1);
  });

  describe('.show()', () => {
    it('shows the toast with the configured message and description', () => {
      new Toast().message('Hello, world!').description('Description here').show();

      expect(mockToastFn).toHaveBeenCalledWith(
        'Hello, world!',
        expect.objectContaining({
          description: 'Description here',
        }),
      );
    });

    describe('when called on an already-visible toast', () => {
      let toast: Toast;

      beforeEach(() => {
        toast = new Toast().message('Hello, world!').show();
      });

      it("updates the toast with the existing toast's ID", () => {
        toast.message('New message here').show();

        expect(mockToastFn).toHaveBeenCalledWith('New message here', { id: MOCK_TOAST_ID });
      });
    });
  });

  describe('.message()', () => {
    it('changes the message once .show() is called', () => {
      const toast = new Toast().message('Hello, world!').description('Description here').show();
      toast.message('New message!').show();

      expect(mockToastFn).toHaveBeenCalledTimes(2);
      expect(mockToastFn).toHaveBeenLastCalledWith(
        'New message!',
        expect.objectContaining({
          description: 'Description here',
        }),
      );
    });
  });

  describe('.description()', () => {
    it('changes the description once .show() is called', () => {
      const toast = new Toast().message('Hello, world!').description('Description here').show();
      toast.description('New description!').show();

      expect(mockToastFn).toHaveBeenCalledTimes(2);
      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          description: 'New description!',
        }),
      );
    });
  });

  describe('.duration()', () => {
    it('changes the duration once .show() is called', () => {
      const toast = new Toast().message('Hello, world!').description('Description here').show();

      toast.duration(10_000).show();

      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          duration: 10_000,
        }),
      );

      toast.duration(Infinity).show();

      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          duration: Infinity,
        }),
      );

      toast.duration(undefined).show();

      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          duration: undefined,
        }),
      );
    });
  });

  describe('.closeButton()', () => {
    it('changes the closeButton setting once .show() is called', () => {
      const toast = new Toast().message('Hello, world!').description('Description here').show();

      toast.closeButton().show();

      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          closeButton: true,
        }),
      );

      toast.closeButton(false).show();

      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          closeButton: false,
        }),
      );
    });
  });

  describe('.dismiss()', () => {
    it('dismisses the toast', () => {
      const toast = new Toast().message('Hello, world!').description('Description here').show();
      toast.dismiss();

      expect(mockToastFn.dismiss).toHaveBeenCalled();
    });
  });

  describe('.default()', () => {
    it('switches to use the default toast function', () => {
      const toast = new Toast()
        // Switch to error first, to verify that it switches back to the default
        .error()
        .message('Hello, world!')
        .description('Description here')
        .show();

      toast.default().show();

      expect(mockToastFn).toHaveBeenCalledTimes(1);
      expect(mockToastFn).toHaveBeenCalledWith(
        'Hello, world!',
        expect.objectContaining({
          description: 'Description here',
        }),
      );
    });
  });

  (['success', 'info', 'warning', 'error', 'loading'] as const).forEach(toastFn => {
    describe(`.${toastFn}()`, () => {
      it(`switches to use the ${toastFn} toast function`, () => {
        const toast = new Toast().message('Hello, world!').description('Description here').show();

        toast[toastFn]().show();

        expect(mockToastFn[toastFn]).toHaveBeenCalledTimes(1);
        expect(mockToastFn[toastFn]).toHaveBeenCalledWith(
          'Hello, world!',
          expect.objectContaining({
            description: 'Description here',
          }),
        );
      });
    });
  });
});
