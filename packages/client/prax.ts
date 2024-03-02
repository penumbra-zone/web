/**
 * Prax is the reference implementation of browser-local Penumbra services. This
 * module provides tools for connecting to Prax specifically, and a few
 * additional conveniences.
 */

import type { JsonValue, ServiceType } from '@bufbuild/protobuf';
import type { Transport } from '@connectrpc/connect';
import { createPromiseClient } from '@connectrpc/connect';
import { createChannelTransport } from '@penumbra-zone/transport-dom/create';
import { jsonOptions } from '@penumbra-zone/types/registry';
import { PenumbraSymbol } from './global';

export class PraxNotAvailableError extends Error {}
export class PraxNotConnectedError extends Error {}
export class PraxManifestError extends Error {}

export const getPraxPort = async () =>
  window[PenumbraSymbol]?.['chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe']?.connect()!;

export const requestPraxConnection = async () =>
  window[PenumbraSymbol]?.['chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe']?.request();

export const isPraxConnected = () =>
  Boolean(
    window[PenumbraSymbol]?.['chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe']?.isConnected(),
  );

export const isPraxConnectedTimeout = (timeout: number) =>
  new Promise<boolean>(resolve => {
    if (
      window[PenumbraSymbol]?.['chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe']?.isConnected()
    )
      resolve(true);

    const interval = setInterval(() => {
      if (
        window[PenumbraSymbol]?.[
          'chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe'
        ]?.isConnected()
      ) {
        clearInterval(interval);
        resolve(true);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      resolve(false);
    }, timeout);
  });

export const throwIfPraxNotConnectedTimeout = async (timeout: number = 500) => {
  if (!(await isPraxConnectedTimeout(timeout)))
    throw new PraxNotConnectedError('Prax not connected');
};

export const isPraxAvailable = () =>
  Boolean(window[PenumbraSymbol]?.['chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe']);

export const throwIfPraxNotAvailable = () => {
  if (!isPraxAvailable()) throw new PraxNotAvailableError('Prax not available');
};

export const throwIfPraxNotConnected = () => {
  if (!isPraxConnected()) throw new PraxNotConnectedError('Prax not connected');
};

export const getPraxManifest = async () => {
  const manifestHref =
    window[PenumbraSymbol]?.['chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe']?.manifest;
  if (manifestHref !== 'chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe/manifest.json')
    throw new PraxManifestError('Incorrect Prax manifest href');
  const manifest = await (await fetch(manifestHref)).json();
  if (manifest['id'] !== 'lkpmkhpnhknhmibgnmmhdhgdilepfghe')
    throw new PraxManifestError('Incorrect Prax manifest id');
  return manifest as JsonValue;
};

let praxTransport: Transport | undefined;
export const createPraxClient = <T extends ServiceType>(serviceType: T) => {
  praxTransport ??= createChannelTransport({
    defaultTimeoutMs: 10000,
    getPort: getPraxPort,
    jsonOptions,
  });
  return createPromiseClient(serviceType, praxTransport);
};
