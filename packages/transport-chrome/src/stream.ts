import type { JsonValue } from '@bufbuild/protobuf';
import { Code, ConnectError } from '@connectrpc/connect';
import { errorFromJson, errorToJson } from '@connectrpc/connect/protocol-connect';
import { captureDisconnectedPortError } from './util/capture-error.js';

/**
 * Sources a `ReadableStream` of `JsonValue` from a `chrome.runtime.Port` backed
 * by a `PortStreamSink`.
 *
 * The sink will transmit a completion message, so abrupt termination is
 * detectable. The sink may also convey a serialized error to put this source
 * into an errored state.
 *
 * If `timeoutMs` is provided, timeout state will be checked on `pull`.
 *
 * The reader may cancel the stream to close the channel.
 */
export class PortStreamSource implements UnderlyingDefaultSource<JsonValue> {
  private streamName: string;

  private started = Promise.withResolvers<ReadableStreamDefaultController<JsonValue>>();

  private disconnect: () => void;

  /**
   * A port can't pull like a normal source, so listeners are attached
   * synchronously at construction. Listener execution blocks until the stream
   * is started and a controller is available.
   *
   * @param incoming port to read from
   * @param timeoutMs (default off) maximum tolerated duration between items
   */
  constructor(
    incoming: chrome.runtime.Port,
    private timeoutMs = 10_000,
  ) {
    this.streamName = incoming.name;

    incoming.onDisconnect.addListener(this.onDisconnect);
    incoming.onMessage.addListener(this.onMessage);
    this.disconnect = () => {
      incoming.onDisconnect.removeListener(this.onDisconnect);
      incoming.onMessage.removeListener(this.onMessage);
      incoming.disconnect();
      clearTimeout(this.timeout);
    };
  }

  /** Make controller available to other methods. */
  start(cont: ReadableStreamDefaultController<JsonValue>) {
    this.started.resolve(cont);
  }

  /** Cleanup when the reader signals disinterest. */
  cancel(reason?: unknown) {
    if (globalThis.__DEV__) {
      console.debug('Source cancel', this.streamName, reason);
    }
    this.disconnect();
  }

  private onDisconnect = () =>
    void this.started.promise.then(cont =>
      cont.error(ConnectError.from('Source disconnected', Code.Aborted)),
    );
  /** Enqueues chunks for value messages, or effects state for control messages. */
  private onMessage = (item: unknown) => {
    if (isStreamValue(item)) {
      void this.started.promise.then(cont => {
        this.updateTimeout(cont);
        cont.enqueue(item.value);
      });
    } else {
      this.disconnect();
      void this.started.promise.then(cont => {
        if (isStreamAbort(item)) {
          cont.error(
            errorFromJson(item.abort, undefined, ConnectError.from('Stream aborted', Code.Aborted)),
          );
        } else if (isStreamEnd(item)) {
          cont.close();
        } else {
          cont.error(new TypeError('Unexpected item in stream', { cause: item }));
        }
      });
    }
  };

  private timeout = setTimeout(() => void 0, 0);
  private updateTimeout = (cont: ReadableStreamDefaultController<JsonValue>) => {
    if (this.timeoutMs) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(
        () => cont.error(ConnectError.from('Source timeout', Code.DeadlineExceeded)),
        this.timeoutMs,
      );
    }
  };
}

/**
 * Rather simple sink for streaming `JsonValue` via `chrome.runtime.Port` to a
 * counterpart `PortStreamSource`.
 *
 * Port disconnect indicates the reader has cancelled the stream.
 */
export class PortStreamSink implements UnderlyingSink<JsonValue> {
  private streamName: string;

  private disconnect: () => void;

  private postAbort: (reason: StreamAbort) => void;
  private postChunk: (chunk: StreamValue) => void;
  private postEnd: (end: StreamEnd) => void;

  /**
   * @param outgoing port to write to
   */
  constructor(
    outgoing: chrome.runtime.Port,
    private timeoutMs = 10_000,
  ) {
    this.streamName = outgoing.name;
    console.debug('Sink construct', this.streamName);

    this.disconnect = () => outgoing.disconnect();

    const postOutgoing = (message: unknown) => outgoing.postMessage(message);
    const postOutgoingSuppressed = (message: unknown) => {
      try {
        outgoing.postMessage(message);
      } catch (e) {
        captureDisconnectedPortError(e);
      }
    };

    this.postAbort = postOutgoingSuppressed;
    this.postChunk = postOutgoing;
    this.postEnd = postOutgoingSuppressed;
  }

  private timeout = setTimeout(() => void 0, 0);
  private updateTimeout = (cont: WritableStreamDefaultController) => {
    if (this.timeoutMs) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(
        () => cont.error(ConnectError.from('Sink timeout', Code.DeadlineExceeded)),
        this.timeoutMs,
      );
    }
  };

  write(chunk: JsonValue, cont: WritableStreamDefaultController) {
    if (globalThis.__DEV__) {
      console.debug('Sink write', this.streamName, chunk);
    }
    this.updateTimeout(cont);
    this.postChunk({ value: chunk });
  }

  close() {
    if (globalThis.__DEV__) {
      console.debug('Sink close', this.streamName);
    }
    try {
      this.postEnd({ done: true });
    } finally {
      this.disconnect();
    }
  }

  abort(reason?: unknown) {
    if (globalThis.__DEV__) {
      console.debug('Sink abort', this.streamName, reason);
    }
    try {
      this.postAbort({ abort: errorToJson(ConnectError.from(reason), undefined) });
    } finally {
      this.disconnect();
    }
  }
}

// control message types below

interface StreamValue {
  value: JsonValue;
}

interface StreamEnd {
  done: true;
}

interface StreamAbort {
  abort: JsonValue;
}

const isStreamValue = (s: unknown): s is StreamValue =>
  s != null && typeof s === 'object' && 'value' in s;

const isStreamEnd = (s: unknown): s is StreamEnd =>
  s != null && typeof s === 'object' && 'done' in s && s.done === true;

const isStreamAbort = (s: unknown): s is StreamAbort =>
  s != null && typeof s === 'object' && 'abort' in s;
