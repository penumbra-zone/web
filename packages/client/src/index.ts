export * from './error';

export const PenumbraSymbol = Symbol.for('penumbra');

/** This interface describes the simple API to request, connect, or disconnect a provider.
 *
 * There are three states for each provider, which may be identified by calling
 * the synchronous method `isConnected()`:
 * - `true`: a connection is available, and a call to `connect` should resolve
 * - `false`: no connection available. calls to `connect` or `request` will fail
 * - `undefined`: a `request` may be pending, or no `request` has been made
 *
 * Any script in page scope may create an object like this, so clients should
 * confirm a provider is actually present by confirming provider origin and
 * fetching the provider manifest. Provider details such as name, version,
 * website, brief descriptive text, and icons should be available in the
 * manifest.
 *
 * Presently clients may expect the manifest is a chrome extension manifest v3.
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
  /** Call when creating a channel transport to this provider.  Returns a promise
   * that may resolve with an active `MessagePort`. */
  readonly connect: () => Promise<MessagePort>;

  /** Call to gain approval to connect.  Returns a `Promise<void>` that may
   * reject with an enumerated failure reason. */
  readonly request: () => Promise<void>;

  /** Call to indicate the provider should revoke approval of this origin. */
  readonly disconnect: () => Promise<void>;

  /** Should synchronously return the present connection state.
   *
   * - `true` indicates active connection.
   * - `false` indicates connection is closed or rejected.
   * - `undefined` indicates connection may be attempted.
   */
  readonly isConnected: () => boolean | undefined;

  /** Should contain a URI at the provider's origin, which returns a chrome
   * extension manifest v3 describing this provider. */
  readonly manifest: string;
}

declare global {
  interface Window {
    /** Records upon this global should identify themselves by a field name
     * matching the origin of the provider. */
    readonly [PenumbraSymbol]?: undefined | Readonly<Record<string, PenumbraInjection>>;
  }
}
