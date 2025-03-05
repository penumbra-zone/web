import type { JsonValue } from '@bufbuild/protobuf';
import { Code, ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import {
  isTransportAbort,
  isTransportEvent,
  isTransportMessage,
  type TransportEvent,
  type TransportError,
  type TransportMessage,
} from '@penumbra-zone/transport-dom/messages';
import { ChannelLabel, nameConnection } from './channel-names.js';
import { isTransportInitChannel, type TransportInitChannel } from './message.js';
import type { CRSessionManager, ManagedPort } from './session-manager.js';
import { suppressDisconnectError } from './util/suppress-disconnect.js';
import { assertMatchingSenders } from './util/senders.js';

const isReadableStream = (value: unknown): value is ReadableStream =>
  value instanceof ReadableStream;

/** Listeners, handling, and abort control for a single transport-chrome session. */
export class CRSession {
  /** The session port's sender. */
  public readonly sender: chrome.runtime.MessageSender & { origin: string };

  /** Abort controllers to cancel pending requests, by requestId. */
  public readonly pending = new Map<string, AbortController>();

  /** Abort signal for the session, bound to the session port. */
  public readonly signal: AbortSignal;

  /** Abort will close the session channel, close all sub-channels, and cancel all pending requests. */
  public readonly abort: AbortController['abort'];

  private readonly approved: Promise<chrome.runtime.Port>;

  /**
   * @param manager the parent session manager
   * @param unvalidatedPort for immediate listener attach only
   * @param sessionAc abort controller for the session
   * @param approved promised port validation (calls manager by default)
   */
  constructor(
    /** the parent session manager */
    private readonly manager: CRSessionManager,
    /**
     * this `unvalidated` port is used to synchronously attach listeners, which
     * prevents a race against incoming messages. it should not be used to
     * send messages, and it should not leave this constructor scope.
     */
    unvalidated: ManagedPort,
    /** the `approved` parameter is used to block listener execution until the
     * port is validated. it should resolve to match the unvalidated port. */
    managerApproval = manager.validateSessionPort(unvalidated.port),
  ) {
    this.signal = unvalidated.portAc.signal;
    this.abort = r => unvalidated.portAc.abort(r);

    this.signal.addEventListener('abort', () => this.pending.forEach(ac => ac.abort()));

    this.sender = unvalidated.port.sender;

    this.approved = managerApproval.then(p => {
      assertMatchingSenders(p.sender, unvalidated.port.sender);
      return p;
    });
    void this.approved.catch((disapproval: unknown) =>
      this.abort(ConnectError.from(disapproval, Code.Unauthenticated)),
    );

    unvalidated.port.onMessage.addListener(this.onMessage);
  }

  /**
   * This listener is attached immediately, but blocks on sender validation.
   *
   * Basic filtering and transport control are handled here. Valid requests are
   * passed to `sessionRequestHandler`, which issues successful responses
   * independently.
   *
   * Failures are caught here and serialized for response.
   */
  private onMessage = (tev: unknown) =>
    void this.approved.then(async () => {
      try {
        // unknown event
        if (!isTransportEvent(tev)) {
          throw new ConnectError(
            'Unknown item in transport',
            Code.Unimplemented,
            undefined,
            undefined,
            tev,
          );
        } else if (isTransportAbort(tev)) {
          // abort control message. no-op if absent
          this.pending.get(tev.requestId)?.abort();
          this.pending.delete(tev.requestId);
        } else if (this.pending.has(tev.requestId)) {
          // request collision would be very strange
          throw new ConnectError('Request collision', Code.Internal, undefined, undefined, tev);
        } else {
          // begin request lifecycle
          try {
            // new request
            const pendingAc = new AbortController();
            this.pending.set(tev.requestId, pendingAc);

            const responseInit: TransportEvent = { requestId: tev.requestId };
            const response = await this.sessionHandler(tev, pendingAc);

            await this.sessionResponder(response, responseInit, pendingAc);
            // complete
          } catch (cause) {
            // failure. attempt to provide an error response
            await this.postError({
              requestId: tev.requestId,
              error: errorToJson(ConnectError.from(cause), undefined),
            });
          } finally {
            this.pending.delete(tev.requestId);
          }
          // end request lifecycle
        }
      } catch (e) {
        // something really weird happened
        console.error('CRSession.onMessage failed', e);
        // might be sensitive so don't propagate
        this.abort(ConnectError.from(undefined, Code.Internal));
      }
    });

  private async sessionHandler(
    tev: TransportEvent,
    pendingAc: AbortController,
  ): Promise<JsonValue | ReadableStream<JsonValue>> {
    if (isTransportMessage(tev)) {
      // handle a message request
      const { message } = tev;
      return this.manager.handler(message, pendingAc.signal);
    } else if (isTransportInitChannel(tev) && globalThis.__DEV__) {
      // handle a streamng request
      const { channel } = tev;
      return this.manager.handler(
        new ReadableStream(await this.manager.acceptSubChannel(channel, this.sender, pendingAc)),
        pendingAc.signal,
      );
    } else {
      throw new ConnectError('Unknown request kind', Code.Unimplemented);
    }
  }

  /**
   * Posts a successful response back to the session channel.
   *
   * For unary responses, sends a TransportMessage with the response value.
   * For streaming responses, creates a subchannel for the stream and sends a
   * TransportInitChannel with the channel name.
   *
   * @param response - The response value or stream to send back
   * @param requestId - The ID of the request being responded to
   * @param requestAc - Abort controller for the request, used to cancel streaming
   */
  private async sessionResponder(
    response: JsonValue | ReadableStream<JsonValue>,
    responseInit: TransportEvent,
    requestAc: AbortController,
  ): Promise<void> {
    if (!isReadableStream(response)) {
      await this.postResponse({ ...responseInit, message: response });
    } else {
      const channel = nameConnection(this.manager.managerId, ChannelLabel.STREAM);
      const sink = this.manager.offerSubChannel(channel, this.sender, requestAc);
      await this.postResponse({ ...responseInit, channel });
      await response.pipeTo(new WritableStream(await sink), { signal: requestAc.signal });
    }
  }

  /**
   * Typed wrapper to post successful responses to the session port.
   * Suppresses 'disconnected' errors.
   */
  private postResponse = (m: TransportMessage | TransportInitChannel) =>
    this.approved.then(approvedPort => {
      try {
        approvedPort.postMessage(m);
      } catch (e) {
        suppressDisconnectError(e);
      }
    });

  /**
   * Typed wrapper to post failure responses to the session port.
   * Suppresses 'disconnected' errors.
   */
  private postError = (e: TransportError<string | undefined>) =>
    this.approved.then(approvedPort => {
      try {
        approvedPort.postMessage(e);
      } catch (e) {
        suppressDisconnectError(e);
      }
    });
}
