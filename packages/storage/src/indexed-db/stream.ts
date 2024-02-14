import { AnyMessage, JsonValue, Message, MessageType } from '@bufbuild/protobuf';
import { PenumbraDb, PenumbraStoreNames } from '@penumbra-zone/types';
import { IDBPCursorWithValue } from 'idb';

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
        cont.enqueue(this.messageType.fromJson(cursor.value as JsonValue));
        cursor = await cursor.continue();
      }
      cont.close();
    })();
  }
}
