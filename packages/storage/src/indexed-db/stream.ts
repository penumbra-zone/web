import type { AnyMessage, JsonValue, Message, MessageType } from '@bufbuild/protobuf';
import type { IDBPCursorWithValue, StoreNames } from 'idb';
import type { IdbUpdate, PenumbraDb, PenumbraStoreNames } from '@penumbra-zone/types/indexed-db';
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

const isIdbStoreUpdate = <DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>(
  item: unknown,
  table: StoreName,
): item is IdbUpdate<DBTypes, StoreName> =>
  typeof item === 'object' &&
  item != null &&
  'table' in item &&
  'value' in item &&
  typeof item.table === 'string' &&
  item.table === table;

export class IdbStoreUpdateSource<
  DBTypes extends PenumbraDb,
  StoreName extends StoreNames<DBTypes>,
> {
  /** used to remove the update event listener when the source is cancelled */
  private ac = new AbortController();

  constructor(
    private readonly events: EventTarget,
    private readonly table: StoreName,
  ) {}

  start(cont: ReadableStreamDefaultController<IdbUpdate<DBTypes, StoreName>>) {
    const listener: EventListener = (event: Event) => {
      if ('detail' in event && isIdbStoreUpdate(event.detail, this.table)) {
        cont.enqueue(event.detail);
      }
    };
    this.events.addEventListener('table-update', listener, { signal: this.ac.signal });
  }

  cancel(reason: unknown) {
    this.ac.abort(reason);
  }
}
