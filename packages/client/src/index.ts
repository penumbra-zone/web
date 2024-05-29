export * from './error';

export const PenumbraSymbol = Symbol.for('penumbra');

export interface PenumbraInjection {
  readonly connect: () => Promise<MessagePort>;
  readonly request: () => Promise<void>;
  readonly disconnect: () => Promise<void>;
  readonly isConnected: () => boolean | undefined;
  readonly manifest: string;
}

declare global {
  interface Window {
    readonly [PenumbraSymbol]?: undefined | Readonly<Record<string, PenumbraInjection>>;
  }
}
