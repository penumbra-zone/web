/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Streams_API
 *
 * This source and sink provide a way to stream json through the chrome runtime.
 */

import type { JsonValue } from '@bufbuild/protobuf';
import { Code, ConnectError } from '@connectrpc/connect';
import { errorFromJson, errorToJson } from '@connectrpc/connect/protocol-connect';

export class PortStreamSource implements UnderlyingDefaultSource<JsonValue> {
  constructor(private incoming: chrome.runtime.Port) {}

  // A port can't pull like a normal source, so handlers are attached at start
  start(cont: ReadableStreamDefaultController<JsonValue>) {
    this.incoming.onDisconnect.addListener(port =>
      cont.error(new ConnectError('Source disconnected', Code.Aborted, undefined, undefined, port)),
    );
    this.incoming.onMessage.addListener(chunk => {
      if (isStreamAbort(chunk))
        cont.error(errorFromJson(chunk.abort, undefined, ConnectError.from(chunk.abort)));
      else if (isStreamValue(chunk)) cont.enqueue(chunk.value);
      else if (isStreamEnd(chunk)) {
        this.incoming.disconnect();
        cont.close();
      } else
        cont.error(
          new ConnectError(
            'Unexpected subchannel transport',
            Code.Unimplemented,
            undefined,
            undefined,
            chunk,
          ),
        );
    });
  }

  cancel() {
    this.incoming.disconnect();
  }
}

export class PortStreamSink implements UnderlyingSink<JsonValue> {
  /**
   * @param outgoing port to write to
   * @param reasonToJson abort reason to jsonifiable
   */
  constructor(private outgoing: chrome.runtime.Port) {}

  write(chunk: JsonValue) {
    this.outgoing.postMessage({
      value: chunk,
    } satisfies StreamValue);
  }

  close() {
    this.outgoing.postMessage({
      done: true,
    } satisfies StreamEnd);
    this.outgoing.disconnect();
  }

  abort(reason?: unknown) {
    this.outgoing.postMessage({
      abort: errorToJson(ConnectError.from(reason), undefined),
    } satisfies StreamAbort);
    this.outgoing.disconnect();
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
