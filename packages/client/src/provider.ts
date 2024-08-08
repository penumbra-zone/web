import type { PenumbraEventTarget } from './event-listener.js';
import type { PenumbraState } from './state.js';

/**
 * If you are simply interested in using a connection, you will probably prefer
 * to use `PenumbraClient` instead of directly manipulating the provider.
 *
 * This interface describes the simple API to connect or disconnect a provider.
 * These methods allow a page to obtain a `MessagePort` to a provider for client
 * creation.
 *
 * The synchronous method `isConnected()` may return:
 * - `true`: a connection is active
 * - `false`: no connection is active
 *
 *  Calling `state` will also indicate a 'pending' state, enumerated by
 *  `PenumbraState`.
 *
 * Any script in page scope may create an object like this, so clients should
 * confirm a provider is actually present. Presence can be verified by fetching
 * the identified provider manifest from the provider's origin.
 *
 * Presently clients can expect the manifest is a chrome extension manifest v3.
 * Provider details such as name, version, website, brief descriptive text, and
 * icons should be available in the manifest.
 * @see https://developer.chrome.com/docs/extensions/reference/manifest
 *
 * A dapp origin's connection approval should be persisted by the provider
 * accross sessions, so that an approved app may re-connect without triggering a
 * new approval prompt.
 *
 * Clients must `connect()` to acquire a `MessagePort`. The resulting
 * `MessagePort` represents an active, type-safe communication channel to the
 * provider. It is convenient to provide the `connect` method as the `getPort`
 * option for `createChannelTransport` from `@penumbra-zone/transport-dom`, but
 * it is recommended to use `PenumbraClient` to manage this process.
 *
 */

export interface PenumbraProvider extends Readonly<PenumbraEventTarget> {
  /** Should contain a URI at the provider's origin, serving a manifest
   * describing this provider. */
  readonly manifest: string;

  /** Call to acquire a `MessagePort` to this provider, subject to approval. */
  readonly connect: () => Promise<MessagePort>;

  /** Call to indicate the provider should discard approval of this origin. */
  readonly disconnect: () => Promise<void>;

  /** Should synchronously return the present connection state.
   * - `true` indicates active connection.
   * - `false` indicates inactive connection.
   */
  readonly isConnected: () => boolean;

  /** Synchronously return present injection state. */
  readonly state: () => PenumbraState;

  /** Like a standard `EventTarget.addEventListener`, but providers should only
   * emit `PenumbraEvent`s (currently only `PenumbraStateEvent` with typename
   * `'penumbrastate'`.)  Event types and type guards are available from
   * `@penumbra-zone/client/event` or the root export.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   */
  readonly addEventListener: PenumbraEventTarget['addEventListener'];
  readonly removeEventListener: PenumbraEventTarget['addEventListener'];
}
