// Renamed, rewritten, and some slightly narrowed types to make them easier to work with

declare interface ChromeEvent<
  T extends (...args: P) => void = (...args: unknown) => void,
  P extends unknown[] = Parameters<T>,
> {
  addListener: (callback: T) => void;
  hasListener: (callback: T) => boolean;
  hasListeners: () => boolean;
  removeListener: (callback: T) => void;
}

declare type ChromeEventListener<E> = E extends ChromeEvent<infer T> ? T : never;
declare type ChromeSender = chrome.runtime.MessageSender;
declare type ChromeConnectInfo = chrome.runtime.ConnectInfo;
declare type ChromePort = chrome.runtime.Port;

/** `chrome.runtime.connect` but narrower, to exclude the inter-extension case */
declare type ChromeConnect = (info?: ChromeConnectInfo) => ChromePort;

declare type ChromeExtensionConnectEvent = chrome.runtime.ExtensionConnectEvent;
