import type { JsonValue } from '@bufbuild/protobuf';
import { ConnectError, Code } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import { shouldDisconnect } from '../util/should-disconnect.js';
import { StreamValue, StreamEnd, StreamAbort } from './message.js';
import { suppressDisconnectedPortError } from '../util/suppress-disconnect.js';

/**
 * Implements an UnderlyingSink that encapsulates an outgoing stream within a
 * Chrome extension messaging channel.
 *
 * In the stream spec's model, this is used by the Producer that writes stream
 * data to a Consumer. It handles the conversion of standard stream write
 * operations into extension message activity.
 */
export class PortStreamSink implements UnderlyingSink<JsonValue> {
  /**
   * Typed method to post valued chunks through the port.
   * Created in the constructor to preclude direct use of the port.
   */
  private postChunk: (item: StreamValue) => void;

  /**
   * Typed method to post terminal chunks through the port.
   * Created in the constructor to preclude direct use of the port.
   */
  private postFinal: (item: StreamEnd | StreamAbort) => Promise<void>;

  constructor(
    outgoing: chrome.runtime.Port,
    public readonly ac = new AbortController(),
  ) {
    this.ac.signal.throwIfAborted();

    this.ac.signal.addEventListener('abort', () => {
      if (globalThis.__DEV__) {
        console.debug('PortStreamSink signal', this.ac.signal.reason);
      }
      outgoing.disconnect();
    });

    this.postChunk = item => outgoing.postMessage(item);

    this.postFinal = async item => {
      // disconnect is no longer a cancellation
      outgoing.onDisconnect.removeListener(this.onDisconnect);

      // set up expectation of counterpart disconnect, but don't rely on that
      const didDisconnect = shouldDisconnect(outgoing).finally(() => outgoing.disconnect());

      try {
        // post the final message
        outgoing.postMessage(item);
      } catch (postFailed) {
        // aggregate failures
        await Promise.any([
          Promise.resolve(postFailed).then(suppressDisconnectedPortError),
          didDisconnect,
        ]);
      }

      await didDisconnect;
    };

    outgoing.onDisconnect.addListener(this.onDisconnect);
  }

  private onDisconnect = () => {
    this.ac.signal.throwIfAborted();

    this.ac.abort(ConnectError.from('Sink disconnected', Code.Canceled));
  };

  /**
   * This is part of UnderlyingSink.
   *
   * This method is called when this sink is provided to a `WritableStream`
   * constructor. Unlike `PortStreamSource`, is no concern about race
   * conditions, as this end of the stream controls the event schedule.
   */
  start(cont: WritableStreamDefaultController) {
    this.ac.signal.throwIfAborted();

    this.ac.signal.addEventListener('abort', () => cont.error(this.ac.signal.reason));
  }

  /** This is part of UnderlyingSink. */
  write(value: JsonValue) {
    this.ac.signal.throwIfAborted();

    this.postChunk({ value });
  }

  /** This is part of UnderlyingSink. */
  async close() {
    this.ac.signal.throwIfAborted();

    await this.postFinal({ done: true });
  }

  /** This is part of UnderlyingSink. */
  async abort(reason?: unknown) {
    this.ac.signal.throwIfAborted();

    await this.postFinal({
      abort: errorToJson(ConnectError.from(reason), undefined),
    });
  }
}
