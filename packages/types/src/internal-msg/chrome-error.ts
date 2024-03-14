type ChromeResponderDroppedError = Error & {
  message: 'A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received';
};
export const isChromeResponderDroppedError = (e: unknown): e is ChromeResponderDroppedError =>
  e instanceof Error &&
  e.message ===
    'A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received';
