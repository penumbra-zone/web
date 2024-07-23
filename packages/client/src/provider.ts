import type { PenumbraStateEventTarget } from './event.js';
import type { PenumbraState } from './state.js';

/**
 * This interface describes the simple page API provided to to connect and
 * obtain a `MessagePort` suitable for client creation.
 *
 * A simplified connection state may be acquired by calling the synchronous
 * method `isConnected()`:
 * - `true`: a connection is available.
 * - `false`: no connection available right now.
 *
 * Calling `.state()` will provide more detail including currently pending
 * state, enumerated by `PenumbraState`.
 *
 * Any script in page scope may create an object like this, so clients should
 * confirm a provider is actually present. Presence can be verified by fetching
 * the identified provider manifest from the provider's origin.
 *
 * Presently, clients can expect the manifest is a chrome extension manifest v3.
 * Provider details such as name, version, website, brief descriptive text, and
 * icons should be available in the manifest.
 * @see https://developer.chrome.com/docs/extensions/reference/manifest
 *
 * Clients must `connect()` to acquire a `MessagePort`. The resulting
 * `MessagePort` represents an active, type-safe communication channel to the
 * provider.
 *
 * It is recommended to use the tools exported from `@penumbra-zone/client`, but
 * for more control, you may provide the `connect` method as the `getPort`
 * option for `createChannelTransport` from `@penumbra-zone/transport-dom`.
 */

export interface PenumbraProvider extends Readonly<PenumbraStateEventTarget> {
  /** Should contain a URI at the provider's origin, serving a manifest
   * describing this provider. */
  readonly manifest: string;

  /** Call to acquire a `MessagePort` to this provider, subject to approval.  May
   * reject with a `PenumbraProviderRequestError` containing an enumerated
   * `PenumbraRequestFailure` cause. */
  readonly connect: () => Promise<MessagePort>;

  /** Call to indicate the provider should discard approval of this origin, and
   * close any present connection. */
  readonly disconnect: () => Promise<void>;

  /** Synchronously returns a boolean representing a simplified connection state.
   * - `true` indicates connection is active
   * - `false` indicates connection is not active */
  readonly isConnected: () => boolean;

  /** Synchronously return one of the enumerated possible connection states. */
  readonly state: () => PenumbraState;

  /** Like a normal EventTarget.addEventListener, but should only emit
   * `PenubraStateEvent` when state changes. Listen for `'penumbrastate'`
   * events, and check the event's `detail` field for a `PenumbraState` value.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener */
  readonly addEventListener: PenumbraStateEventTarget['addEventListener'];
  readonly removeEventListener: PenumbraStateEventTarget['addEventListener'];
}
