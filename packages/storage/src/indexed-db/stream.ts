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
  store: StoreName,
): item is IdbUpdate<DBTypes, StoreName> =>
  typeof item === 'object' &&
  item != null &&
  'store' in item &&
  'key' in item &&
  item.store === store;

export class IdbStoreUpdateSource<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>
  implements UnderlyingDefaultSource<IdbUpdate<DBTypes, StoreName>>
{
  private ac = new AbortController();
  private listener?: EventListener;

  constructor(
    private readonly events: EventTarget,
    private readonly store: StoreName,
  ) {}

  start(cont: ReadableStreamDefaultController<IdbUpdate<DBTypes, StoreName>>) {
    this.listener = (event: Event) => {
      if ('detail' in event && isIdbStoreUpdate(event.detail, this.store)) {
        cont.enqueue(event.detail);
      }
    };
    this.events.addEventListener('idb-update', this.listener, { signal: this.ac.signal });
  }

  cancel(reason: unknown) {
    this.ac.abort(reason);
  }
}
