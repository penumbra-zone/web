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

  it('does not render the toast until .render() is called', () => {
    const toast = new Toast().message('Hello, world!').description('Description here');

    expect(mockToastFn).not.toHaveBeenCalled();
    toast.render();
    expect(mockToastFn).toHaveBeenCalledTimes(1);
  });

  describe('.render()', () => {
    it('renders the toast with the configured message and description', () => {
      new Toast().message('Hello, world!').description('Description here').render();

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
        toast = new Toast().message('Hello, world!').render();
      });

      it("updates the toast with the existing toast's ID", () => {
        toast.message('New message here').render();

        expect(mockToastFn).toHaveBeenCalledWith('New message here', { id: MOCK_TOAST_ID });
      });
    });
  });

  describe('.message()', () => {
    it('changes the message once .render() is called', () => {
      const toast = new Toast().message('Hello, world!').description('Description here').render();
      toast.message('New message!').render();

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
    it('changes the description once .render() is called', () => {
      const toast = new Toast().message('Hello, world!').description('Description here').render();
      toast.description('New description!').render();

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
    it('changes the duration once .render() is called', () => {
      const toast = new Toast().message('Hello, world!').description('Description here').render();

      toast.duration(10_000).render();

      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          duration: 10_000,
        }),
      );

      toast.duration(Infinity).render();

      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          duration: Infinity,
        }),
      );

      toast.duration(undefined).render();

      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          duration: undefined,
        }),
      );
    });
  });

  describe('.closeButton()', () => {
    it('changes the closeButton setting once .render() is called', () => {
      const toast = new Toast().message('Hello, world!').description('Description here').render();

      toast.closeButton().render();

      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          closeButton: true,
        }),
      );

      toast.closeButton(false).render();

      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          closeButton: false,
        }),
      );
    });
  });

  describe('.action()', () => {
    it('sets the action once .render() is called', () => {
      const onClick = vi.fn();
      new Toast().message('Hello, world!').action('Click here', onClick).render();

      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          action: {
            label: 'Click here',
            onClick,
          },
        }),
      );
    });

    it('provides a default no-op click handler if no onClick is passed', () => {
      new Toast().message('Hello, world!').action('Click here').render();

      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          action: expect.objectContaining({
            label: 'Click here',
            onClick: expect.any(Function) as unknown,
          }) as unknown,
        }),
      );
    });

    it('sets the action back to `undefined` if `undefined` is passed', () => {
      const toast = new Toast().message('Hello, world!').action('Click here').render();

      // First, ensure that an action is actually being set.
      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          action: expect.any(Object) as unknown,
        }),
      );

      toast.action(undefined).render();

      expect(mockToastFn).toHaveBeenLastCalledWith(
        'Hello, world!',
        expect.objectContaining({
          action: undefined,
        }),
      );
    });
  });

  describe('.dismiss()', () => {
    it('dismisses the toast', () => {
      const toast = new Toast().message('Hello, world!').description('Description here').render();
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
        .description('Description here');

      toast.default().render();

      expect(mockToastFn.error).not.toHaveBeenCalled();
      expect(mockToastFn).toHaveBeenCalledTimes(1);
    });
  });

  it('switches the toast function', () => {
    const toast = new Toast().message('Hello, world!').description('Description here').render();
    (['success', 'info', 'warning', 'error', 'loading'] as const).map(toastFn => {
      toast[toastFn]().render();
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
