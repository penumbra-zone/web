import { vi, MockedFunction, Mocked } from 'vitest';

// eslint-disable-next-line @typescript-eslint/ban-types -- meeting external type
type ChromeEvent<T extends Function = (...args: unknown[]) => void> = chrome.events.Event<T>;
type ChromeEventListener<E> = E extends ChromeEvent<infer T> ? T : never;

/**
 * Mock the listeners manager for any `chrome.events.Event` type, such as
 * `chrome.runtime.ExtensionConnectEvent` or `chrome.runtime.PortMessageEvent`.
 *
 * Does not support event rules or listeners with `filter` parameters.
 *
 * @param listeners set of existing listeners
 * @returns an inspectable {@link MockedChromeEvent} providing dispatch and insight
 */
export const mockEvent = <E extends ChromeEvent>(
  listeners = new Set<ChromeEventListener<E>>(),
): MockedChromeEvent<E> => {
  const dispatch = (...params: Parameters<ChromeEventListener<E>>): void =>
    listeners.forEach(listener => {
      try {
        listener(...params);
      } catch (cause) {
        /**
         * this is pretending to be 'remote' dispatch, so the exception should
         * not propagate across the dispatch boundary. instead of suppressing
         * it, a voided reject rethrows it to the unhandled rejection listener.
         *
         * the try-catch block is used, instead of simply voiding a promisifed
         * listener call, to simulate the 'synchronous' properties of chrome
         * runtime messaging.
         */

        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- rethrow
        void Promise.reject(cause);

        console.warn(
          'MockedChromeEvent dispatch to',
          vi.isMockFunction(listener) ? listener.getMockName() : listener.name,
          'failed',
          { params, cause },
        );
      }
    });

  const addListener = (i: ChromeEventListener<E>): void => void listeners.add(i);
  const hasListener = (i: ChromeEventListener<E>): boolean => listeners.has(i);
  const hasListeners = (): boolean => listeners.size > 0;
  const removeListener = (i: ChromeEventListener<E>): void => void listeners.delete(i);

  return {
    listeners,
    dispatch: vi.fn(dispatch),

    addListener: vi.fn(addListener),
    hasListener: vi.fn(hasListener),
    hasListeners: vi.fn(hasListeners),
    removeListener: vi.fn(removeListener),

    getRules: vi.fn() as never,
    addRules: vi.fn() as never,
    removeRules: vi.fn() as never,
  };
};

/**
 * Mock interface for a `chrome.events.Event` listener manager, such as
 * `chrome.runtime.ExtensionConnectEvent` or `chrome.runtime.PortMessageEvent`.
 *
 * Does not support event rules or listeners with `filter` parameters.
 *
 * Create with {@link mockEvent}
 */
export interface MockedChromeEvent<T extends ChromeEvent = ChromeEvent>
  extends Mocked<ChromeEvent<ChromeEventListener<T>>> {
  /** inspectable set of attached listeners */
  listeners: Set<ChromeEventListener<T>>;
  /** dispatch the event to activate attached listeners */
  dispatch: MockedFunction<(...args: Parameters<ChromeEventListener<T>>) => void>;

  addListener: MockedFunction<(callback: ChromeEventListener<T>) => void>;
  hasListener: MockedFunction<(callback: ChromeEventListener<T>) => boolean>;
  hasListeners: MockedFunction<() => boolean>;
  removeListener: MockedFunction<(callback: ChromeEventListener<T>) => void>;
}
