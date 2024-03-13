/**
 * Prax is the reference implementation of browser-local Penumbra services. This
 * module provides tools for connecting to Prax specifically, and a few
 * additional conveniences.
 */

import type { JsonValue, ServiceType } from '@bufbuild/protobuf';
import type { Transport } from '@connectrpc/connect';
import { createPromiseClient } from '@connectrpc/connect';
import { createChannelTransport } from '@penumbra-zone/transport-dom/src/create';
import { PenumbraSymbol } from './global';
import { jsonOptions } from '@penumbra-zone/types/src/registry';

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe' as const;
const prax_origin = `chrome-extension://${prax_id}`;

export class PraxNotAvailableError extends Error {}
export class PraxNotConnectedError extends Error {}
export class PraxManifestError extends Error {}

export const getPraxPort = async () => {
  const provider = window[PenumbraSymbol]?.[prax_origin];
  if (!provider) throw new Error('Prax not installed');
  return provider.connect();
};

export const requestPraxConnection = async () => window[PenumbraSymbol]?.[prax_origin]?.request();

export const isPraxConnected = () => Boolean(window[PenumbraSymbol]?.[prax_origin]?.isConnected());

export const isPraxConnectedTimeout = (timeout: number) =>
  new Promise<boolean>(resolve => {
    if (window[PenumbraSymbol]?.[prax_origin]?.isConnected()) resolve(true);

    const interval = setInterval(() => {
      if (window[PenumbraSymbol]?.[prax_origin]?.isConnected()) {
        clearInterval(interval);
        resolve(true);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      resolve(false);
    }, timeout);
  });

export const throwIfPraxNotConnectedTimeout = async (timeout = 500) => {
  const isConnected = await isPraxConnectedTimeout(timeout);
  if (!isConnected) throw new PraxNotConnectedError('Prax not connected');
};

export const isPraxInstalled = () => Boolean(window[PenumbraSymbol]?.[prax_origin]);

export const throwIfPraxNotAvailable = () => {
  if (!isPraxInstalled()) throw new PraxNotAvailableError('Prax not available');
};

export const throwIfPraxNotConnected = () => {
  if (!isPraxConnected()) throw new PraxNotConnectedError('Prax not connected');
};

export const getPraxManifest = async () => {
  const manifestHref = window[PenumbraSymbol]?.[prax_origin]?.manifest;
  if (manifestHref !== `${prax_origin}/manifest.json`)
    throw new PraxManifestError('Incorrect Prax manifest href');

  const response = await fetch(manifestHref);
  return (await response.json()) as JsonValue;
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
