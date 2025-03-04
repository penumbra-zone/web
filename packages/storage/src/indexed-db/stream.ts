import { AnyMessage, JsonValue, Message, MessageType } from '@bufbuild/protobuf';
import { IDBPCursorWithValue } from 'idb';
import type { PenumbraDb, PenumbraStoreNames } from '@penumbra-zone/types/indexed-db';
import { typeRegistry } from '@penumbra-zone/protobuf';

export class IdbCursorSource<N extends PenumbraStoreNames, T extends Message<T> = AnyMessage>
  implements UnderlyingDefaultSource<T>
{
  constructor(
    private cursor: Promise<IDBPCursorWithValue<PenumbraDb, [N], N> | null>,
    private messageType: MessageType<T>,
  ) {}

  start(cont: ReadableStreamDefaultController<T>) {
    // immediately stream as fast as possible, to prevent idb from closing the tx
    void (async () => {
      let cursor = await this.cursor;
      while (cursor) {
        cont.enqueue(this.messageType.fromJson(cursor.value as JsonValue, { typeRegistry }));
        cursor = await cursor.continue();
      }
      cont.close();
    })();
  }
}
