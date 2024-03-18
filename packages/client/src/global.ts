export enum PraxConnectionRes {
  Approved = 'Approved',
  Denied = 'Denied',
  NotLoggedIn = 'NotLoggedIn',
}

export const PenumbraSymbol = Symbol.for('penumbra');

export interface PenumbraProvider {
  readonly connect: () => Promise<MessagePort>;
  readonly request: () => Promise<PraxConnectionRes>;
  readonly isConnected: () => boolean | undefined;
  readonly manifest: string;
}

declare global {
  interface Window {
    readonly [PenumbraSymbol]?: undefined | Readonly<Record<string, PenumbraProvider>>;
  }
}
