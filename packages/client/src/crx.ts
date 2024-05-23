// chrome-extension id are 32 bytes of mpdecimal
export const validCrxId = /^[a-p]{32}$/;

// do not export
// const crx = Symbol('crx');

export type CrxId = string;
// type CrxId = string & { [crx]: 'id' };

export const isCrxId = (id: string): id is CrxId => validCrxId.test(id);

export const isCrxResourceUrl = <X extends CrxId, P extends string>(
  u: unknown,
  id?: X,
  path?: P,
): u is CrxResourceUrl<X, P> =>
  typeof u === 'string' &&
  (id
    ? // if id is defined, match it
      isCrxId(id) && u.startsWith(`chrome-extension://${id}`)
    : // otherwise accept any valid id
      u.startsWith(`chrome-extension://`) && isCrxId(u.slice(19, 19 + 32))) &&
  u[19 + 32] === '/' &&
  (path
    ? // if path is defined, match it
      u.slice(19 + 32) === path
    : // otherwise accept any path deeper than root
      u.slice(19 + 32).length > 1);

export const isCrxManifestUrl = <X extends CrxId>(
  u: string,
  id?: X,
): u is CrxResourceUrl<X, '/manifest.json'> => isCrxResourceUrl(u, id, '/manifest.json');

export type CrxResourceUrl<
  X extends string = string,
  P extends string = string,
> = `chrome-extension://${X}/${P}`;
