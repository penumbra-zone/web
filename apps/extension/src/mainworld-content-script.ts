import { isInitServiceMessage } from '@penumbra-zone/transport';

const penumbra = Symbol.for('penumbra');
declare global {
  interface Window {
    [penumbra]?: Record<string, MessagePort>;
  }
}

const serviceInit = (ev: MessageEvent<unknown>) => {
  if (isInitServiceMessage(ev)) {
    const { services, port } = ev.data;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    window[penumbra] = Object.fromEntries(services.map((s: string) => [s, port]));
  }
  window.removeEventListener('message', serviceInit);
};

window.addEventListener('message', serviceInit);
