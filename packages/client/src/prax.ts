/**
 * Prax is the reference implementation of browser-local Penumbra services. This
 * module provides tools for connecting to Prax specifically, and a few
 * additional conveniences.
 */

import type { ServiceType } from '@bufbuild/protobuf';
import type { PromiseClient, Transport } from '@connectrpc/connect';
import { createPromiseClient } from '@connectrpc/connect';
import { createChannelTransport } from '@penumbra-zone/transport-dom/create';
import { jsonOptions } from '@penumbra-zone/protobuf';
import Penumbra from '.';

export class PraxNotConnectedError extends Error {}
export class PraxNotAvailableError extends Error {}

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';

export const prax = () => Penumbra.get(prax_id);

export const assertPrax = () => {
  const prax = Penumbra.get(prax_id);
  if (!prax) throw new PraxNotAvailableError('Prax not available');
  return prax;
};

export const isPraxAvailable = () => Penumbra.init.then(() => Boolean(prax()));
export const isPraxConnected = () => Penumbra.init.then(() => prax()?.isConnected());

export const getPraxPort = () => Penumbra.init.then(() => assertPrax().connect());
export const requestPraxConnection = () => Penumbra.init.then(() => assertPrax().request());

export const throwIfPraxNotAvailable = () => Penumbra.init.then(() => void assertPrax());
export const throwIfPraxNotConnected = () =>
  Penumbra.init.then(() => {
    if (!prax()?.isConnected()) throw new PraxNotConnectedError('Prax not connected');
  });

let praxTransport: Transport | undefined;
export const createPraxTransport = () =>
  (praxTransport ??= createChannelTransport({
    jsonOptions,
    getPort: getPraxPort,
  }));

export const createPraxClient = <T extends ServiceType>(serviceType: T): PromiseClient<T> =>
  createPromiseClient(serviceType, createPraxTransport());
