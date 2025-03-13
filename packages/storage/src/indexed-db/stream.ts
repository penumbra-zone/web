import { DescMessage, fromJson, JsonValue, MessageShape } from '@bufbuild/protobuf';
import { IDBPCursorWithValue } from 'idb';
import type { PenumbraDb, PenumbraStoreNames } from '@penumbra-zone/types/indexed-db';
import { typeRegistry } from '@penumbra-zone/protobuf';

export class IdbCursorSource<N extends PenumbraStoreNames, T extends DescMessage> {
  constructor(
    private cursor: Promise<IDBPCursorWithValue<PenumbraDb, [N], N> | null>,
    private messageType: T,
  ) {}

  start(cont: ReadableStreamDefaultController<MessageShape<T>>) {
    // immediately stream as fast as possible, to prevent idb from closing the tx
    void (async () => {
      let cursor = await this.cursor;
      while (cursor) {
        cont.enqueue(
          fromJson(this.messageType, cursor.value as JsonValue, { registry: typeRegistry }),
        );
        cursor = await cursor.continue();
      }
      cont.close();
    })();
  }
}
