import type { JsonValue } from '@bufbuild/protobuf';
import { ConnectError, Code } from '@connectrpc/connect';
import { isStreamAbort, isStreamEnd, isStreamValue } from './message.js';
import { errorFromJson } from '@connectrpc/connect/protocol-connect';

/**
 * Implements a UnderlyingSource that encapsulates an outgoing stream within a
 * Chrome extension messaging channel.
 *
 * In the stream spec's model, is used by the Consumer side that receives stream
 * data from a Producer. It handles the conversion of Chrome extension messages
 * into standard readable stream activity.
 */
export class PortStreamSource implements UnderlyingDefaultSource<JsonValue> {
  /** Abort controller for port disconnect */
  private ac = new AbortController();

  /** Controller provided by `start` to be used by `onMessage` listener */
  private cont?: ReadableStreamDefaultController<JsonValue>;

  constructor(incoming: chrome.runtime.Port) {
    this.ac.signal.addEventListener('abort', () => {
      incoming.disconnect();
      this.cont?.error(this.ac.signal.reason);
    });

    incoming.onDisconnect.addListener(this.onDisconnect);
    incoming.onMessage.addListener(this.onMessage);
  }

  private onDisconnect = () =>
    this.ac.abort(ConnectError.from('Source disconnected', Code.Unavailable));

  /** Listens for incoming messages from the port. */
  private onMessage = (item: unknown, incoming: chrome.runtime.Port) => {
    if (!this.cont) {
      this.ac.abort(new Error('Stream item arrived before start', { cause: item }));
    } else {
      try {
        this.ac.signal.throwIfAborted();

        if (isStreamValue(item)) {
          // accept a value
          this.cont.enqueue(item.value);
        } else if (isStreamEnd(item)) {
          // close successfully
          incoming.disconnect();
          this.cont.close();
        } else if (isStreamAbort(item)) {
          // deserialize abort
          incoming.disconnect();
          this.cont.error(
            errorFromJson(
              item.abort,
              undefined,
              ConnectError.from('Failed to deserialize abort reason'),
            ),
          );
        } else {
          // should never happen
          throw new TypeError('Unexpected stream item', { cause: item });
        }
      } catch (e) {
        incoming.disconnect();
        this.cont.error(e);
      }
    }
  };

  /** This is part of UnderlyingSource. */
  start(cont: ReadableStreamDefaultController<JsonValue>) {
    this.cont = cont;
    this.ac.signal.throwIfAborted();
  }

  /** This is part of UnderlyingSource. */
  pull() {
    // This pull method will surface an unhandled signal, but is otherwise
    // considered a 'no-op' implementation, and will not be called repeatedly by
    // a consumer.
    this.ac.signal.throwIfAborted();
  }

  /** This is part of UnderlyingSource. */
  cancel(reason?: unknown) {
    this.ac.abort(ConnectError.from(reason, Code.Canceled));
  }
}
