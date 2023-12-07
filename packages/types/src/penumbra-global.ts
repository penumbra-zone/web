/*
 * This type describes the Penumbra page global, injected by an extension content script.
 */

export interface Exposed {
  services?: Record<string, MessagePort>;
}

// export is awkward, but you can copy

const penumbra = Symbol.for('penumbra');
declare global {
  interface Window {
    [penumbra]?: Exposed;
  }
}
