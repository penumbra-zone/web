// Renamed, rewritten, and some slightly narrowed types to make them easier to work with

declare type ChromeEvent<T = (...args: unknown[]) => void> = chrome.events.Event<T>;
declare type ChromeEventListener<E> = E extends ChromeEvent<infer T> ? T : never;
