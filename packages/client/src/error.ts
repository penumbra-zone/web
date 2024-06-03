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

export class PenumbraNotConnectedError extends Error {
  constructor(
    message = 'Penumbra extension not connected',
    public opts?: ErrorOptions,
  ) {
    super(message, opts);
    this.name = 'PenumbraNotConnectedError';
  }
}

export class PenumbraRequestError extends Error {
  constructor(
    message = 'Penumbra request failed',
    public opts?: ErrorOptions & { cause: PenumbraRequestFailure },
  ) {
    super(message, opts);
    this.name = 'PenumbraRequestError';
  }
}
export class PenumbraNotInstalledError extends Error {
  constructor(
    message = 'Penumbra not installed',
    public opts?: ErrorOptions,
  ) {
    super(message, opts);
    this.name = 'PenumbraNotInstalledError';
  }
}
