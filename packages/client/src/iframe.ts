import { isCrxResourceUrl, CrxResourceUrl, isCrxId } from './crx';

export type PenumbraZoneResponse<X extends string = string> = { [I in X]: CrxResourceUrl<I> };

const isPenumbraZoneResponse = (
  ev: MessageEvent<unknown>,
): ev is MessageEvent<{ penumbra: PenumbraZoneResponse }> =>
  ev.data != null &&
  typeof ev.data === 'object' &&
  'penumbra' in ev.data &&
  typeof ev.data.penumbra === 'object' &&
  ev.data.penumbra != null &&
  Object.entries(ev.data.penumbra).every(
    ([key, value]) => isCrxId(key) && isCrxResourceUrl(value, key),
  );

export const penumbraZone = async (): Promise<PenumbraZoneResponse> => {
  const penumbraZone = document.createElement('iframe');
  penumbraZone.hidden = true;

  let messageTarget = '*';
  console.log('iframe message target', messageTarget);

  const {
    promise: penumbraResponse,
    resolve,
    reject,
  } = Promise.withResolvers<PenumbraZoneResponse>();
  void penumbraResponse.finally(() => document.body.removeChild(penumbraZone));

  const responseListener = (ev: MessageEvent<unknown>) => {
    console.log('message from iframe?', ev);
    if (ev.origin.startsWith('chrome-extension://') && isPenumbraZoneResponse(ev)) {
      console.log('resolving', ev.data['penumbra']);
      resolve(ev.data.penumbra);
      window.removeEventListener('message', responseListener);
    }
  };

  penumbraZone.addEventListener('load', () => {
    if (!penumbraZone.contentWindow) reject(new Error('no iframe window'));
    else {
      window.addEventListener('message', responseListener);
      penumbraZone.contentWindow.postMessage('penumbra', messageTarget);
    }
  });

  penumbraZone.src = 'https://penumbra.zone.invalid/providers';
  document.body.appendChild(penumbraZone);
  console.log('appended iframe', penumbraZone);

  return penumbraResponse;
};
