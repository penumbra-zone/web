import type { PromiseClient, Transport } from '@connectrpc/connect';
import { createPromiseClient } from '@connectrpc/connect';
import {
  PenumbraNotConnectedError,
  PenumbraNotInstalledError,
  PenumbraSymbol,
} from '@penumbra-zone/client';
import type { PenumbraService } from '@penumbra-zone/protobuf';
import { jsonOptions } from '@penumbra-zone/protobuf';
import { createChannelTransport } from '@penumbra-zone/transport-dom/create';

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';
const prax_origin = `chrome-extension://${prax_id}`;
const prax_manifest = `chrome-extension://${prax_id}/manifest.json`;

export const getPraxManifest = async () => {
  const res = await fetch(prax_manifest);
  return (await res.json()) as unknown;
};

export const getPraxOrigin = () => prax_origin;

export const isPraxConnected = () => Boolean(window[PenumbraSymbol]?.[prax_origin]?.isConnected());

export const isPraxInstalled = async () => {
  try {
    await getPraxManifest();
    return true;
  } catch {
    return false;
  }
};

export const throwIfPraxNotConnected = () => {
  if (!isPraxConnected())
    throw new PenumbraNotConnectedError('Prax not connected', { cause: prax_origin });
};

export const throwIfPraxNotInstalled = async () => {
  if (!(await isPraxInstalled()))
    throw new PenumbraNotInstalledError('Prax not installed', { cause: prax_origin });
};

export const getPraxPort = async () => {
  await throwIfPraxNotInstalled();
  return window[PenumbraSymbol]![prax_origin]!.connect();
};

export const requestPraxAccess = async () => {
  await throwIfPraxNotInstalled();
  await window[PenumbraSymbol]?.[prax_origin]?.request();
};

export const praxTransportOptions = {
  jsonOptions,
  getPort: getPraxPort,
};

export const createPraxTransport = () => createChannelTransport(praxTransportOptions);

let praxTransport: Transport | undefined;
export const createPraxClient = <T extends PenumbraService>(service: T): PromiseClient<T> =>
  createPromiseClient(service, (praxTransport ??= createPraxTransport()));
