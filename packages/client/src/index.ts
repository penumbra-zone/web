export * from './error';

export const PenumbraSymbol = Symbol.for('penumbra');

/**
 * This interface describes the simple API to request, connect, or disconnect a
 * provider. These methods allow a page to acquire permission to connect, and
 * obtain a `MessagePort` to be used for client creation.
 *
 * There are three connection states for each provider, which may be identified
 * by calling the synchronous method `isConnected()`:
 * - `true`: a connection is available, and a call to `connect` should resolve
 * - `false`: no connection available. calls to `connect` or `request` will fail
 * - `undefined`: a call may be pending, or no call has been made
 *
 * Each injection may should also track state-changing actions, so calling
 * `.state()` should provide more detail including currently pending state,
 * enumerated by `PenumbraInjectionState`.
 *
 * Any script in page scope may create an object like this, so clients should
 * confirm a provider is actually present. Presence can be securely verified by
 * fetching the identified provider manifest from the provider's origin.
 *
 * Presently clients can expect the manifest is a chrome extension manifest v3.
 * Provider details such as name, version, website, brief descriptive text, and
 * icons should be available in the manifest.
 * @see https://developer.chrome.com/docs/extensions/reference/manifest
 *
 * Clients may `request()` approval to connect. This method may reject if the
 * provider chooses to deny approval.  Approval granted by a successful
 * request will persist accross sessions.
 *
 * Clients must `connect()` to acquire a `MessagePort`. The resulting
 * `MessagePort` represents an active, type-safe communication channel to the
 * provider. It is convenient to provide the `connect` method as the `getPort`
 * option for `createChannelTransport` from `@penumbra-zone/transport-dom`, or
 * use the helpers available in `@penumbra-zone/client/create`.
 *
 */
export interface PenumbraInjection {
  /** Should contain a URI at the provider's origin, serving a manifest
   * describing this provider. */
  readonly manifest: string;

  /** Call to acquire a `MessagePort` to this provider, subject to approval. */
  readonly connect: () => Promise<MessagePort>;

  /** Call to gain approval.  May reject with a `PenumbraProviderRequestError`
   * containing an enumerated `PenumbraRequestFailure` cause. */
  readonly request: () => Promise<void>;

  /** Call to indicate the provider should discard approval of this origin. */
  readonly disconnect: () => Promise<void>;

  /** Should synchronously return the present connection state.
   * - `true` indicates active connection.
   * - `false` indicates connection is closed or rejected.
   * - `undefined` no attempt has resolved. connection may be attempted.
   */
  readonly isConnected: () => boolean | undefined;

  /** Synchronously return present injection state. */
  readonly state: () => PenumbraInjectionState;

  /** Emits `PenubraInjectionStateEvent` when state changes. Listen for
   * `'penumbrastate'` events, and check the `detail` field for a
   * `PenumbraInjectionState` value. */
  readonly addEventListener: EventTarget['addEventListener'];
  readonly removeEventListener: EventTarget['removeEventListener'];
}

export class PenumbraInjectionStateEvent extends CustomEvent<PenumbraInjectionState> {
  constructor(override readonly detail: PenumbraInjectionState) {
    super('penumbrastate', { detail });
  }
}

export enum PenumbraInjectionState {
  /* error is present */
  'Failed' = 'Failed',

  /* no action has been taken */
  'Present' = 'Present',

  /* approval request pending */
  'RequestPending' = 'RequestPending',
  /* request for approval satisfied */
  'Requested' = 'Requested',

  /* connection attempt pending */
  'ConnectPending' = 'ConnectPending',
  /* connection successful and active */
  'Connected' = 'Connected',

  /* disconnect was called to release approval */
  'Disconnected' = 'Disconnected',
}

declare global {
  interface Window {
    /** Records injected upon this global should identify themselves by a field
     * name matching the origin of the provider. */
    readonly [PenumbraSymbol]?: undefined | Readonly<Record<string, PenumbraInjection>>;
  }
}
