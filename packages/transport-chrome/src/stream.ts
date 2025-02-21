import type { JsonValue } from '@bufbuild/protobuf';
import { Code, ConnectError } from '@connectrpc/connect';
import { errorFromJson, errorToJson } from '@connectrpc/connect/protocol-connect';

export class PortStreamSource implements UnderlyingDefaultSource<JsonValue> {
  private cont?: ReadableStreamDefaultController<JsonValue>;
  private timeout?: AbortSignal;

  constructor(
    private incoming: chrome.runtime.Port,
    private timeoutMs = 30_000,
  ) {
    incoming.onDisconnect.addListener(this.onDisconnect);
    incoming.onMessage.addListener(this.onMessage);

    if (this.timeoutMs) {
      this.timeout = AbortSignal.timeout(this.timeoutMs);
    }
  }

  start(cont: ReadableStreamDefaultController<JsonValue>) {
    this.cont = cont;
    this.resetTimeout();
  }

  cancel(reason?: unknown) {
    this.incoming.disconnect();
    this.cont?.error(ConnectError.from(reason, Code.Canceled));
  }

  pull(cont: ReadableStreamDefaultController<JsonValue>, chunk?: JsonValue) {
    this.timeout?.throwIfAborted();
    if (chunk != null) {
      if (isStreamValue(chunk)) {
        cont.enqueue(chunk.value);
        this.resetTimeout();
      } else {
        // any other kind of message is a disconnect
        this.incoming.disconnect();

        if (isStreamAbort(chunk)) {
          cont.error(errorFromJson(chunk.abort, undefined, ConnectError.from(chunk.abort)));
        } else if (isStreamEnd(chunk)) {
          cont.close();
        } else {
          cont.error(
            new ConnectError(
              'Unexpected subchannel transport',
              Code.Unimplemented,
              undefined,
              undefined,
              chunk,
            ),
          );
        }
      }
    }
  }

  private onDisconnect = () =>
    this.cont?.error(ConnectError.from('Source disconnected', Code.Unavailable));

  private onMessage = (message: unknown) => {
    if (this.cont) {
      this.pull(this.cont, message as JsonValue);
    } else {
      console.error('Source not started!', message);
      this.incoming.disconnect();
    }
  };

  // setup or reset the timeout clock.
  private resetTimeout() {
    this.timeout?.throwIfAborted();
    if (this.timeoutMs) {
      // remove the old timeout listener
      this.timeout?.removeEventListener('abort', this.timeoutListener);
      // clobber the timeout signal
      this.timeout = AbortSignal.timeout(this.timeoutMs);
      this.timeout.addEventListener('abort', this.timeoutListener);
    }
  }

  private timeoutListener = () => {
    if (this.timeout?.aborted) {
      this.incoming.disconnect();
      this.cont?.error(this.timeout.reason);
    }
  };
}

export class PortStreamSink implements UnderlyingSink<JsonValue> {
  private cont?: WritableStreamDefaultController;

  private postChunk: (item: StreamValue | StreamEnd | StreamAbort) => void;

  private timeout?: AbortSignal;

  constructor(
    private outgoing: chrome.runtime.Port,
    private timeoutMs = 60_000,
  ) {
    this.outgoing.onDisconnect.addListener(() =>
      this.cont?.error(ConnectError.from('Sink disconnected', Code.Canceled)),
    );

    this.postChunk = item => {
      try {
        this.outgoing.postMessage(item);
      } catch (e) {
        if (this.cont) {
          this.cont.error(ConnectError.from(e, Code.Canceled));
        } else {
          throw e;
        }
      }
    };

    if (this.timeoutMs) {
      this.timeout = AbortSignal.timeout(this.timeoutMs);
    }
  }

  start(cont: WritableStreamDefaultController) {
    try {
      this.cont = cont;
      this.resetTimeout();
    } catch (e) {
      this.outgoing.disconnect();
      throw e;
    }
  }

  write(chunk: JsonValue, cont: WritableStreamDefaultController) {
    this.cont ??= cont;
    try {
      this.resetTimeout();
      this.postChunk({ value: chunk });
    } catch (e) {
      this.outgoing.disconnect();
      cont.error(e);
    }
  }

  close() {
    try {
      this.timeout?.throwIfAborted();
      this.postChunk({ done: true });
    } catch (e) {
      this.outgoing.disconnect();
      throw e;
    }
  }

  abort(reason?: unknown) {
    try {
      this.timeout?.throwIfAborted();
      this.postChunk({
        abort: errorToJson(ConnectError.from(reason), undefined),
      });
    } catch (e) {
      this.outgoing.disconnect();
      throw e;
    }
  }

  // setup or reset the timeout clock.
  private resetTimeout() {
    this.timeout?.throwIfAborted();
    if (this.timeoutMs) {
      // remove listener from the old timeout
      this.timeout?.removeEventListener('abort', this.timeoutListener);
      // clobber the old timeout
      this.timeout = AbortSignal.timeout(this.timeoutMs);
      this.timeout.addEventListener('abort', this.timeoutListener);
    }
  }

  private timeoutListener = () => {
    if (this.timeout?.aborted) {
      this.outgoing.disconnect();
      this.cont?.error(this.timeout.reason);
    }
  };
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
