import { Code, ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import {
  isTransportAbort,
  isTransportEvent,
  isTransportMessage,
  type TransportError,
  type TransportMessage,
} from '@penumbra-zone/transport-dom/messages';
import { ChannelLabel, nameConnection } from './channel-names.js';
import { isTransportInitChannel, type TransportInitChannel } from './message.js';
import type { CRSessionManager, ManagedPort } from './session-manager.js';
import { PortStreamSink, PortStreamSource } from './stream.js';
import { rethrowOrSuppressDisconnectedPortError } from './suppress-disconnected.js';
import { assertSenderWithOrigin } from './util/senders.js';

const isReadableStream = (value: unknown): value is ReadableStream =>
  value instanceof ReadableStream;

/**
 * Listeners and abort control for a single transport-chrome session.
 */
export class CRSession {
  /**
   * Abort the session.
   *
   * This closes the session channel, cancels all pending requests, and closes
   * all sub-channels.
   */
  public readonly abort: (r?: unknown) => void;

  /** The session abort signal. */
  public readonly signal: AbortSignal;

  /** The session port sender. */
  public readonly sender: chrome.runtime.MessageSender & { origin: string };

  /** Abort controllers to cancel pending requests, by requestId. */
  public readonly pending = new Map<string, AbortController>();

  constructor(
    // reference to the parent session manager
    private readonly manager: CRSessionManager,
    {
      // this unvalidated port is used to synchronously attach listeners, to
      // avoid a race against incoming messages. it should not be used to send
      // messages, and it should not leave the constructor scope.
      port: unvalidatedPort,
      portAc: sessionAc,
    }: ManagedPort,
    // blocks listener execution until the port is validated
    private readonly approved = manager.validateSessionPort(unvalidatedPort),
  ) {
    this.sender = assertSenderWithOrigin(unvalidatedPort.sender);

    this.signal = sessionAc.signal;
    this.abort = (r?: unknown) => sessionAc.abort(r);

    this.signal.addEventListener('abort', () =>
      this.pending.forEach(pendingAc => pendingAc.abort()),
    );

    void this.approved.catch(() => this.abort());

    unvalidatedPort.onMessage.addListener(this.sessionListener);
  }

  private postResponse = (m: TransportMessage | TransportInitChannel) =>
    this.approved.then(approvedPort => {
      try {
        approvedPort.postMessage(m);
      } catch (e) {
        rethrowOrSuppressDisconnectedPortError(e);
      }
    });

  private postFailure = (e: TransportError<string | undefined>) =>
    this.approved.then(approvedPort => {
      try {
        approvedPort.postMessage(e);
      } catch (e) {
        rethrowOrSuppressDisconnectedPortError(e);
      }
    });

  /**
   * This listener is attached immediately, but blocks on sender validation.
   *
   * Basic filtering and transport control are handled here. Valid requests are
   * passed to `sessionRequestHandler`, which issues successful responses
   * independently.
   *
   * Failures are caught here and serialized for response.
   */
  private sessionListener = (tev: unknown) =>
    void this.approved.then(async () => {
      if (!isTransportEvent(tev)) {
        console.warn('Unknown item in transport', tev);
        // exit condition
      } else {
        const requestId = tev.requestId;
        if (isTransportAbort(tev)) {
          // abort control message
          this.pending.get(requestId)?.abort();
          this.pending.delete(requestId);
          // exit condition
        } else if (this.pending.has(requestId)) {
          // request collisions can't be handled
          console.error('Request collision', tev);
          // exit condition
        } else {
          // it's a new request
          try {
            const pendingAc = new AbortController();
            this.pending.set(requestId, pendingAc);
            if (isTransportMessage(tev) || (globalThis.__DEV__ && isTransportInitChannel(tev))) {
              // successful responses are posted by `sessionHandler`
              await this.sessionHandler(tev, pendingAc);
            } else {
              throw new ConnectError('Unknown request kind', Code.Unimplemented);
            }
          } catch (cause) {
            // attempt to provide an error response
            await this.postFailure({
              requestId,
              error: errorToJson(ConnectError.from(cause), undefined),
            });
          } finally {
            this.pending.delete(requestId);
          }
        }
      }
    });

  /**
   * Accepts a request, queries the manager's handler for a response, and posts
   * a successful response back to the session channel.
   *
   * Will independently emit:
   * - `TransportMessage` for message responses
   * - `TransportInitChannel` for streaming responses
   *
   * Requests are abortable through the entire process. The manager's handler
   * should respect abort requests when provided. After, response stream sinking
   * is interruptable by the same signal.
   *
   * All actions are awaited, to capture errors under the serialization provided
   * by `sessionListener`.
   */
  private async sessionHandler(
    tev: TransportMessage | TransportInitChannel,
    requestAc: AbortController,
  ): Promise<void> {
    const requestId = tev.requestId;

    const request = !isTransportInitChannel(tev)
      ? // simple message request
        tev.message
      : // streaming request
        await this.manager
          .acceptSubChannel(tev.channel, this.sender)
          .then(({ port: approvedPort }) => new ReadableStream(new PortStreamSource(approvedPort)));

    const response = await this.manager.handler(request, requestAc.signal);

    if (!isReadableStream(response)) {
      // simple message response
      await this.postResponse({ requestId, message: response });
    } else {
      // streaming response
      const channel = nameConnection(this.manager.managerId, ChannelLabel.STREAM);

      // begin listening for the sink channel
      const responseSink = this.manager
        .offerSubChannel(channel, this.sender)
        .then(({ port: approvedPort }) => new WritableStream(new PortStreamSink(approvedPort)));

      // announce sink channel to the client
      await this.postResponse({ requestId, channel });

      // stream the response, maintaining the request abort signal
      await response.pipeTo(await responseSink, { signal: requestAc.signal });
    }
  }

  /**
   * The session port sender's origin.
   */
  public get origin() {
    return this.sender.origin;
  }
}
