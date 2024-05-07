/**
 * Prax is the reference implementation of browser-local Penumbra services. This
 * module provides tools for connecting to Prax specifically, and a few
 * additional conveniences.
 */

import type { JsonValue, ServiceType } from '@bufbuild/protobuf';
import type { Transport } from '@connectrpc/connect';
import { createPromiseClient } from '@connectrpc/connect';
import { createChannelTransport } from '@penumbra-zone/transport-dom/create';
import { jsonOptions } from '@penumbra-zone/protobuf';
import { CRSessionClient } from '@penumbra-zone/transport-chrome/session-client';

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';
const prax_manifest = `chrome-extension://${prax_id}/manifest.json`;

export class PraxNotAvailableError extends Error {}
export class PraxNotConnectedError extends Error {}
export class PraxNotInstalledError extends Error {}
export class PraxManifestError extends Error {}

export const getPraxPort = () => Promise.resolve(CRSessionClient.init(prax_id, true));

export const requestPraxConnection = () => Promise.resolve();

export const isPraxConnected = () => true;

export const isPraxConnectedTimeout = (x: number) => Promise.resolve(Boolean(x));

export const throwIfPraxNotConnectedTimeout = async (timeout = 500) => {
  const isConnected = await isPraxConnectedTimeout(timeout);
  if (!isConnected) throw new PraxNotConnectedError('Prax not connected');
};

export const isPraxAvailable = () => true;

export const throwIfPraxNotAvailable = () => {
  if (!isPraxAvailable()) throw new PraxNotAvailableError('Prax not available');
};

export const throwIfPraxNotConnected = () => {
  if (!isPraxConnected()) throw new PraxNotConnectedError('Prax not connected');
};

export const getPraxManifest = async () => {
  const response = await fetch(prax_manifest);
  return (await response.json()) as JsonValue;
};

export const isPraxInstalled = () =>
  getPraxManifest().then(
    () => true,
    () => false,
  );

export const throwIfPraxNotInstalled = async () => {
  const isInstalled = await isPraxInstalled();
  if (!isInstalled) throw new PraxNotInstalledError('Prax not installed');
};

export const createPraxTransport = () =>
  createChannelTransport({
    jsonOptions,
    getPort: getPraxPort,
  });

let praxTransport: Transport | undefined;
export const createPraxClient = <T extends ServiceType>(serviceType: T) => {
  praxTransport ??= createPraxTransport();
  return createPromiseClient(serviceType, praxTransport);
};
