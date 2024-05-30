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
