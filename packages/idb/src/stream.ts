import { AnyMessage, JsonValue, Message, MessageType } from '@bufbuild/protobuf';
import { IDBPCursorWithValue, StoreNames } from 'idb';
import { PenumbraSchema } from './schema';

export class IdbCursorSource<
  N extends StoreNames<PenumbraSchema>,
  T extends Message<T> = AnyMessage,
> implements UnderlyingDefaultSource<T>
{
  constructor(
    private cursor: Promise<IDBPCursorWithValue<PenumbraSchema, [N], N> | null>,
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
