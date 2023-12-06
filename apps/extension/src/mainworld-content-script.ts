/*
 * This content script is injected and executes in the same context as the page.
 * It listens for a single message from the isolated script, and creates the
 * global that provides entry to the Penumbra extension. This process should be
 * complete before page scripts begin to execute.
 */

import type { Exposed } from '@penumbra-zone/types/src/penumbra-global';

import { isInitPenumbra } from './types/content-script-init';

const penumbra = Symbol.for('penumbra');
declare global {
  interface Window {
    [penumbra]?: Exposed;
  }
}

const initPenumbra = (ev: MessageEvent<unknown>) => {
  if (ev.origin === window.origin && isInitPenumbra(ev)) {
    const { services, port } = ev.data;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    window[penumbra] ??= {} as Exposed;
    window[penumbra].services = {
      ...(window[penumbra].services ?? {}),
      ...Object.fromEntries(services.map((s: string) => [s, port])),
    };
  }
  window.removeEventListener('message', initPenumbra);
};

window.addEventListener('message', initPenumbra);
