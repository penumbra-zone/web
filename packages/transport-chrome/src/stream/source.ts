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
  /** Controller provided by `start` to be used by `onMessage` listener */
  private cont?: ReadableStreamDefaultController<JsonValue>;

  constructor(
    incoming: chrome.runtime.Port,
    public readonly ac = new AbortController(),
  ) {
    this.ac.signal.throwIfAborted();

    this.ac.signal.addEventListener('abort', () => {
      if (globalThis.__DEV__) {
        console.debug('PortStreamSource signal', incoming.name, this.ac.signal.reason);
      }
      incoming.disconnect();
      this.cont?.error(this.ac.signal.reason);
    });

    incoming.onDisconnect.addListener(this.onDisconnect);
    incoming.onMessage.addListener(this.onMessage);
  }

  private onDisconnect = (): void => {
    this.ac.signal.throwIfAborted();

    this.ac.abort(ConnectError.from('Stream source disconnected', Code.Aborted));
  };

  /** Listens for incoming messages from the port. */
  private onMessage = (item: unknown, incoming: chrome.runtime.Port): void => {
    this.ac.signal.throwIfAborted();

    try {
      if (!this.cont) {
        throw new ReferenceError('PortStreamSource not started', { cause: item });
      }

      if (isStreamValue(item)) {
        // accept a value
        this.cont.enqueue(item.value);
      } else if (isStreamEnd(item)) {
        if (globalThis.__DEV__) {
          console.debug('PortStreamSource end', incoming.name);
        }
        // close successfully
        incoming.disconnect();
        this.cont.close();
      } else if (isStreamAbort(item)) {
        if (globalThis.__DEV__) {
          console.debug('PortStreamSource abort', incoming.name, item.abort);
        }
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
    } catch (failedHandling) {
      this.ac.abort(failedHandling);
    }
  };

  /**
   * This is part of UnderlyingSource.
   *
   * This method is called when this source is provided to a `ReadableStream`
   * constructor. If a `ReadableStream` is not constructed immediately and
   * synchronously, the port may begin delivering messages before a controller
   * is available.
   */
  start(cont: ReadableStreamDefaultController<JsonValue>) {
    this.ac.signal.throwIfAborted();

    this.cont = cont;
    this.ac.signal.addEventListener('abort', () => cont.error(this.ac.signal.reason));
  }

  /**
   * This is part of UnderlyingSource.
   *
   * This pull method will surface an unhandled abort, but does not enqueue
   * chunks.  This means a consumer will call to express interest in more data,
   * but will not call again until after some data is delivered.
   */
  pull() {
    this.ac.signal.throwIfAborted();
  }

  /** This is part of UnderlyingSource. */
  cancel(reason?: unknown) {
    this.ac.signal.throwIfAborted();

    this.ac.abort(ConnectError.from(reason, Code.Canceled));
  }
}
