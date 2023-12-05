import { JsonValue } from '@bufbuild/protobuf';
import { StreamChannelChunk, StreamChannelEnd, isStreamControl } from '../types';

/**
 * Adapts a chrome.runtime.Port to a ReadableStreamSource
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
    this.incoming.onDisconnect.addListener(() => cont.error('Source port disconnected'));
    this.incoming.onMessage.addListener(msg => {
      if (!isStreamControl(msg)) cont.error('Unknown message in stream channel');
      else {
        if (msg.sequence < this.sequence) cont.error('Stream disordered');
        else this.sequence = msg.sequence;
        if ('done' in msg) {
          this.incoming.disconnect();
          cont.close();
        } else cont.enqueue(msg.value);
      }
    });
  }

  cancel() {
    this.incoming.disconnect();
  }
}

/**
 * Adapts a chrome.runtime.Port to a WritableStreamSink
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

  abort() {
    this.outgoing.disconnect();
  }
}
