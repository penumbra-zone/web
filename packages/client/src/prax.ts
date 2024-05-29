/**
 * Prax is the reference implementation of browser-local Penumbra services. This
 * module provides tools for connecting to Prax specifically, and a few
 * additional conveniences.
 */

import type { JsonValue } from '@bufbuild/protobuf';
import type { PromiseClient, Transport } from '@connectrpc/connect';
import type { PenumbraService } from '@penumbra-zone/protobuf';

import { createPromiseClient } from '@connectrpc/connect';
import { createChannelTransport } from '@penumbra-zone/transport-dom/create';
import { PenumbraSymbol } from '.';
import { jsonOptions } from '@penumbra-zone/protobuf';

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';
const prax_origin = `chrome-extension://${prax_id}`;
const prax_manifest = `chrome-extension://${prax_id}/manifest.json`;

export const isPraxAvailable = () => Boolean(window[PenumbraSymbol]?.[prax_origin]);

export const isPraxConnected = () => Boolean(window[PenumbraSymbol]?.[prax_origin]?.isConnected());

export const isPraxInstalled = async () => {
  try {
    // can check independent of injection presence, as the manifest url is known
    const { ok } = await fetch(prax_manifest);
    return ok;
  } catch {
    return false;
  }
};

export const throwIfPraxNotAvailable = () => {
  if (!isPraxAvailable()) throw new PraxNotAvailableError();
};

export const throwIfPraxNotConnected = () => {
  if (!isPraxConnected()) throw new PraxNotConnectedError();
};

export const throwIfPraxNotInstalled = async () => {
  if (!(await isPraxInstalled())) throw new PraxNotInstalledError();
};

export const getPraxManifest = async () => {
  const json = await fetch(prax_manifest).then(
    ({ ok, json }) => (ok ? json : Promise.reject(new PraxNotInstalledError())),
    () => Promise.reject(new PraxNotInstalledError()),
  );
  return (await json()) as JsonValue;
};

export const getPraxPort = async () => {
  await throwIfPraxNotInstalled();
  throwIfPraxNotAvailable();
  return window[PenumbraSymbol]![prax_origin]!.connect();
};

export const requestPraxConnection = async () => {
  await throwIfPraxNotInstalled();
  throwIfPraxNotAvailable();
  await window[PenumbraSymbol]![prax_origin]!.request();
};

export const praxTransportOptions = {
  jsonOptions,
  getPort: getPraxPort,
};

export const createPraxTransport = () => createChannelTransport(praxTransportOptions);

let praxTransport: Transport | undefined;
export const createPraxClient = <T extends PenumbraService>(service: T): PromiseClient<T> =>
  createPromiseClient(service, (praxTransport ??= createPraxTransport()));

export class PraxNotAvailableError extends Error {
  constructor(
    message = 'Prax not available',
    public opts?: ErrorOptions,
  ) {
    super(message, opts);
    this.name = 'PraxNotAvailableError';
  }
}

export class PraxNotConnectedError extends Error {
  constructor(
    message = 'Prax not connected',
    public opts?: ErrorOptions,
  ) {
    super(message, opts);
    this.name = 'PraxNotConnectedError';
  }
}

export class PraxNotInstalledError extends Error {
  constructor(
    message = 'Prax not installed',
    public opts?: ErrorOptions,
  ) {
    super(message, opts);
    this.name = 'PraxNotInstalledError';
  }
}

export class PraxManifestError extends Error {
  constructor(
    message = 'Incorrect Prax manifest href',
    public opts?: ErrorOptions,
  ) {
    super(message, opts);
    this.name = 'PraxManifestError';
  }
}
