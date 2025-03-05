import type { JsonValue } from '@bufbuild/protobuf';
import { ConnectError, Code } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import { shouldDisconnect } from '../util/should-disconnect.js';
import { StreamValue, StreamEnd, StreamAbort } from './message.js';

/**
 * Implements an UnderlyingSink that encapsulates an outgoing stream within a
 * Chrome extension messaging channel.
 *
 * In the stream spec's model, this is used by the Producer that writes stream
 * data to a Consumer. It handles the conversion of standard stream write
 * operations into extension message activity.
 */
export class PortStreamSink implements UnderlyingSink<JsonValue> {
  /** Abort controller for port disconnect */
  private ac = new AbortController();

  /** Typed method to post valued chunks through the port. */
  private postChunk: (item: StreamValue) => void;

  /** Typed method to post terminal chunks through the port. */
  private postFinal: (item: StreamEnd | StreamAbort) => Promise<void>;

  constructor(outgoing: chrome.runtime.Port) {
    this.postChunk = item => outgoing.postMessage(item);

    this.postFinal = async item => {
      // disconnect is no longer a cancellation
      outgoing.onDisconnect.removeListener(this.onDisconnect);
      // set up expectation that the counterpart will disconnect
      const termination = shouldDisconnect(outgoing);
      // post the final message
      outgoing.postMessage(item);
      await termination.finally(
        // ensure port disconnected
        () => outgoing.disconnect(),
      );

      outgoing.onDisconnect.addListener(this.onDisconnect);
    };

    this.ac.signal.addEventListener('abort', () => {
      if (globalThis.__DEV__) {
        console.debug('PortStreamSink signal', this.ac.signal.reason);
      }
      outgoing.disconnect();
    });
  }

  private onDisconnect = () => this.ac.abort(ConnectError.from('Sink disconnected', Code.Canceled));

  /** This is part of UnderlyingSink. */
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
    await this.postFinal({ done: true });
  }

  /** This is part of UnderlyingSink. */
  async abort(reason?: unknown) {
    await this.postFinal({
      abort: errorToJson(ConnectError.from(reason), undefined),
    });
  }
}
