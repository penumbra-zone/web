import { vi, MockedFunction, Mocked } from 'vitest';

export const eventMocked = <E extends ChromeEvent>(event: E): MockedChromeEvent<E> =>
  event as unknown as MockedChromeEvent<E>;

/**
 * Mock the listeners manager for any `chrome.events.Event` type, such as
 * `chrome.runtime.ExtensionConnectEvent` or `chrome.runtime.PortMessageEvent`.
 *
 * Does not support event rules or listeners with `filter` parameters.
 *
 * @param listeners set object, will be used for internal state
 * @returns event manager with mocked features, direct dispatch, and insight to listeners
 */

export const mockEvent = <
  E extends ChromeEvent,
  L extends E extends ChromeEvent<infer T> ? T : never = E extends ChromeEvent<infer T> ? T : never,
>(
  listeners = new Set<L>(),
): MockedChromeEvent<E> => {
  // dispatch method to activate the listeners
  const dispatch = (...i: Parameters<L>) => listeners.forEach(listener => listener(...i));

  const addListener = (i: L): void => void listeners.add(i);
  const hasListener = (i: L): boolean => listeners.has(i);
  const hasListeners = (): boolean => listeners.size > 0;
  const removeListener = (i: L): void => void listeners.delete(i);

  return {
    listeners,
    dispatch: vi.fn(dispatch),

    addListener: vi.fn(addListener),
    hasListener: vi.fn(hasListener),
    hasListeners: vi.fn(hasListeners),
    removeListener: vi.fn(removeListener),
  } as unknown as MockedChromeEvent<E>;
};

export interface MockedChromeEvent<T extends ChromeEvent = ChromeEvent>
  extends Mocked<ChromeEvent<ChromeEventListener<T>>> {
  listeners: Set<ChromeEventListener<T>>;

  dispatch: MockedFunction<(...args: Parameters<ChromeEventListener<T>>) => void>;

  addListener: MockedFunction<(callback: ChromeEventListener<T>) => void>;

  hasListener: MockedFunction<(callback: ChromeEventListener<T>) => boolean>;

  hasListeners: MockedFunction<() => boolean>;

  removeListener: MockedFunction<(callback: ChromeEventListener<T>) => void>;
}
