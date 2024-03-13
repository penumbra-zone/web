// Promise.withResovlers is a convenience function already shipping in major
// browsers, but not yet in typescript.
// Definition copied from https://github.com/microsoft/TypeScript/pull/56593
export interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void;
}

declare global {
  interface PromiseConstructor {
    withResolvers<T = void>(): PromiseWithResolvers<T>;
  }
}
