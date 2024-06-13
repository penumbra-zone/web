import { PenumbraInjection, PenumbraSymbol } from '@penumbra-zone/client';

export const keyOfInjection = (injection?: PenumbraInjection) =>
  Object.entries(window[PenumbraSymbol] ?? {}).find(
    ([keyOrigin, valueInjection]) =>
      keyOrigin &&
      // matching injection
      valueInjection === injection,
  )?.[0];

export const injectionOfKey = (keyOrigin?: string) =>
  keyOrigin ? window[PenumbraSymbol]?.[keyOrigin] : undefined;

export const assertStringIsOrigin = (s?: string) => {
  if (!s || new URL(s).origin !== s) throw new TypeError('Invalid origin');
  return s;
};

export const assertManifestOrigin = (s?: string, injection?: PenumbraInjection) => {
  const originString = assertStringIsOrigin(s);
  if (!injection?.manifest || new URL(injection.manifest).origin !== originString) {
    throw new TypeError('Invalid manifest origin');
  }
  return [originString, injection] satisfies [string, PenumbraInjection];
};
