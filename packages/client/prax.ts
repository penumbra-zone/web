/**
 * Prax is the reference implementation of browser-local Penumbra services. This
 * module provides tools for connecting to Prax specifically, and a few
 * additional conveniences.
 */

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe' as const;
const prax_origin = `chrome-extension://${prax_id}`;

import type { JsonValue, ServiceType } from '@bufbuild/protobuf';
import type { Transport } from '@connectrpc/connect';
import { createPromiseClient } from '@connectrpc/connect';
import { createChannelTransport } from '@penumbra-zone/transport-dom/create';
import { jsonOptions } from '@penumbra-zone/types/registry';
import { PenumbraSymbol } from './global';

export class PraxNotAvailableError extends Error {}
export class PraxNotConnectedError extends Error {}
export class PraxManifestError extends Error {}

export const getPraxPort = async () => window[PenumbraSymbol]?.[prax_origin]?.connect()!;

export const requestPraxConnection = async () => window[PenumbraSymbol]?.[prax_origin]?.request();

export const isPraxConnected = () => Boolean(window[PenumbraSymbol]?.[prax_origin]?.isConnected());

export const isPraxConnectedTimeout = (timeout: number) =>
  new Promise<boolean>(resolve => {
    const isConnected = window[PenumbraSymbol]?.[prax_origin]?.isConnected();
    if (!isConnected) resolve(true);

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

export const throwIfPraxNotConnectedTimeout = async (timeout: number = 500) => {
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
  const manifest = await (await fetch(manifestHref)).json();
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
