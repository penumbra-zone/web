import type { JsonValue } from '@bufbuild/protobuf';
import { StreamChannelChunk, StreamChannelEnd, isStreamAbort, isStreamControl } from '../types';

/**
 * Adapts a chrome.runtime.Port to a ReadableStream UnderlyingSource
 *
 * @param incoming port to read from
 */
export class ChromeRuntimeStreamSource implements UnderlyingDefaultSource<JsonValue> {
  private sequence = 0;
  constructor(private incoming: chrome.runtime.Port) {}

  /**
   * A message port can't pull like a normal source.
   * Handlers set up here fill the queue as messages arrive.
   */
  start(cont: ReadableStreamDefaultController<JsonValue>) {
    this.incoming.onDisconnect.addListener(() =>
      cont.error(new DOMException('Source port disconnected', 'AbortError')),
    );
    this.incoming.onMessage.addListener(msg => {
      if (isStreamAbort(msg)) cont.error(new DOMException(String(msg.reason), 'AbortError'));
      else if (isStreamControl(msg)) {
        if (msg.sequence < this.sequence) cont.error('Stream disordered');
        else this.sequence = msg.sequence;
        if ('done' in msg) {
          this.incoming.disconnect();
          cont.close();
        } else cont.enqueue(msg.value);
      } else cont.error('Unexpected subchannel transport');
    });
  }

  cancel() {
    this.incoming.disconnect();
  }
}

/**
 * Adapts a chrome.runtime.Port to a WritableStream UnderlyingSink
 *
 * @param outgoing port to write to
 */
export class ChromeRuntimeStreamSink implements UnderlyingSink<JsonValue> {
  private sequence = 0;
  constructor(private outgoing: chrome.runtime.Port) {}

  write(chunk: JsonValue) {
    this.outgoing.postMessage({
      sequence: ++this.sequence,
      value: chunk,
    } as StreamChannelChunk);
  }

  close() {
    this.outgoing.postMessage({
      sequence: ++this.sequence,
      done: true,
    } as StreamChannelEnd);
    this.outgoing.disconnect();
  }

  abort(reason: unknown) {
    this.outgoing.postMessage({
      sequence: ++this.sequence,
      abort: true,
      reason: String(reason),
    });
    this.outgoing.disconnect();
  }
}
