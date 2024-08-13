import type { PenumbraProvider } from './provider.js';
import { PenumbraSymbol } from './symbol.js';

declare global {
  interface Window {
    /** Records injected upon this global should be identified by a name matching
     * the origin segment of their manifest href `PenumbraProvider['manifest']`. */
    readonly [PenumbraSymbol]?: Readonly<Record<string, PenumbraProvider>>;
  }
}
