export enum PenumbraRequestFailure {
  Denied = 'Denied',
  NeedsLogin = 'NeedsLogin',
}

export class PenumbraNotAvailableError extends Error {
  constructor(
    message = "Penumbra global `window[Symbol.for('penumbra')]` is not available",
    public opts?: ErrorOptions,
  ) {
    super(message, opts);
    this.name = 'PenumbraNotAvailableError';
  }
}
export class PenumbraProviderNotAvailableError extends Error {
  constructor(
    providerOrigin?: string,
    public opts?: ErrorOptions,
  ) {
    super(`Penumbra provider ${providerOrigin} is not available`, opts);
    this.name = 'PenumbraNotAvailableError';
  }
}

export class PenumbraProviderNotConnectedError extends Error {
  constructor(
    providerOrigin?: string,
    public opts?: ErrorOptions,
  ) {
    super(`Penumbra provider ${providerOrigin} is not connected`, opts);
    this.name = 'PenumbraNotConnectedError';
  }
}

export class PenumbraProviderRequestError extends Error {
  constructor(
    providerOrigin?: string,
    public opts?: ErrorOptions & { cause: PenumbraRequestFailure },
  ) {
    super(`Penumbra provider ${providerOrigin} did not approve request`, opts);
    this.name = 'PenumbraRequestError';
  }
}
export class PenumbraProviderNotInstalledError extends Error {
  constructor(
    providerOrigin?: string,
    public opts?: ErrorOptions,
  ) {
    super(`Penumbra provider ${providerOrigin} is not installed`, opts);
    this.name = 'PenumbraNotInstalledError';
  }
}
