export enum PenumbraRequestFailure {
  Denied = 'Denied',
  NeedsLogin = 'NeedsLogin',
  BadResponse = 'BadResponse',
  NotHandled = 'NotHandled',
}

export class PenumbraProviderNotAvailableError extends Error {
  constructor(providerOrigin?: string, opts?: ErrorOptions) {
    super(`Penumbra provider ${providerOrigin} is not available`, opts);
    this.name = 'PenumbraProviderNotAvailableError';
  }
}

export class PenumbraProviderNotConnectedError extends Error {
  constructor(providerOrigin?: string, opts?: ErrorOptions) {
    super(`Penumbra provider ${providerOrigin} is not connected`, opts);
    this.name = 'PenumbraProviderNotConnectedError';
  }
}

export class PenumbraProviderRequestError extends Error {
  constructor(providerOrigin?: string, opts?: ErrorOptions & { cause: PenumbraRequestFailure }) {
    super(`Penumbra provider ${providerOrigin} did not approve request`, opts);
    this.name = 'PenumbraProviderRequestError';
  }
}
export class PenumbraNotInstalledError extends Error {
  constructor(
    message = "Penumbra global `window[Symbol.for('penumbra')]` is not present.",
    opts?: ErrorOptions,
  ) {
    super(message, opts);
    this.name = 'PenumbraNotInstalledError';
  }
}
