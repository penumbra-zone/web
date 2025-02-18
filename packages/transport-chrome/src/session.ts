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

/**
 * Listeners and abort control for a single session.
 *
 * @param manager - the parent session manager
 * @param unvalidatedPort - for synchronous listener attach
 * @param approved - port validation promise
 */
export class CRSession {
  public readonly abort: (r?: unknown) => void;
  public readonly signal: AbortSignal;

  public readonly sender: chrome.runtime.MessageSender & { origin: string };
  public get origin() {
    return this.sender.origin;
  }

  public readonly pending = new Map<string, AbortController>();

  constructor(
    /** reference to the parent session manager */
    private readonly manager: CRSessionManager,
    {
      /**
       * this unvalidated port is used to synchronously attach listeners, to
       * avoid a race against incoming messages.
       *
       * the unvalidated port must not leave the constructor scope.
       */
      port: unvalidatedPort,
      portAc: sessionAc,
    }: ManagedPort,
    /** blocks listener execution until the port is validated. */
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
   * passed to `sessionRequestHandler`. Failures are caught here and serialized
   * for response.
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
   * Accepts a request, queries the method router for a response, and posts it
   * back to the session channel. Any errors thrown from here should be caught
   * and serialized into responses by `sessionListener`.
   */
  private async sessionHandler(
    tev: TransportMessage | TransportInitChannel,
    requestAc: AbortController,
  ): Promise<void> {
    const requestId = tev.requestId;

    const request = isTransportMessage(tev)
      ? tev.message
      : await this.manager
          .acceptSubChannel(tev.channel, this.sender)
          .then(({ port: approvedPort }) => new ReadableStream(new PortStreamSource(approvedPort)));

    const response = await this.manager.handler(request, requestAc.signal);
    if (response instanceof ReadableStream) {
      const channel = nameConnection(this.manager.managerId, ChannelLabel.STREAM);
      const responseSink = this.manager
        .offerSubChannel(channel, this.sender)
        .then(({ port: approvedPort }) => new WritableStream(new PortStreamSink(approvedPort)));
      await this.postResponse({ requestId, channel });
      await response.pipeTo(await responseSink, { signal: requestAc.signal });
    } else {
      await this.postResponse({ requestId, message: response });
    }
  }
}
