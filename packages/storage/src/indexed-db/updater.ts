import { IDBPDatabase, StoreNames } from 'idb';
import type { IdbUpdate, PenumbraDb } from '@penumbra-zone/types/indexed-db';

export class IbdUpdates {
  constructor(readonly all: IdbUpdate<PenumbraDb, StoreNames<PenumbraDb>>[] = []) {}

  add<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>(
    update: IdbUpdate<DBTypes, StoreName>,
  ) {
    this.all.push(update);
  }
}

type Resolver = (value: IdbUpdate<PenumbraDb, StoreNames<PenumbraDb>>) => void;

export class IbdUpdater {
  private readonly subscribers: Map<StoreNames<PenumbraDb>, Resolver[]>;

  constructor(private readonly db: IDBPDatabase<PenumbraDb>) {
    this.subscribers = new Map();
  }

  subscribe<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>(
    table: StoreName,
  ): AsyncGenerator<IdbUpdate<DBTypes, StoreName>, void> {
    const subscriber = async function* (subscriberMap: Map<StoreNames<PenumbraDb>, Resolver[]>) {
      while (true) {
        const update = await new Promise<IdbUpdate<DBTypes, StoreName>>(resolve => {
          const resolversForTable = subscriberMap.get(table) ?? [];
          resolversForTable.push(resolve as Resolver);
          subscriberMap.set(table, resolversForTable);
        });
        yield update;
      }
    };

    return subscriber(this.subscribers);
  }

  async updateAll(updates: IbdUpdates): Promise<void> {
    const tables = updates.all.map(u => u.table);
    const tx = this.db.transaction(tables, 'readwrite');

    // Batch all the updates into promises
    for (const update of updates.all) {
      tx.objectStore(update.table).put(update.value, update.key);
    }

    // Await the atomic transaction to complete
    await tx.done;

    // Notify subscribers after the transaction has successfully committed
    for (const update of updates.all) {
      this.notifySubscribers(update);
    }
  }

  async update<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>(
    update: IdbUpdate<DBTypes, StoreName>,
  ): Promise<void> {
    const updates = new IbdUpdates();
    updates.add(update);
    await this.updateAll(updates);
  }

  private notifySubscribers<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>(
    update: IdbUpdate<DBTypes, StoreName>,
  ) {
    const resolversForTable = this.subscribers.get(update.table);
    if (resolversForTable) {
      for (const resolve of resolversForTable) {
        resolve(update);
      }
      this.subscribers.set(update.table, []); // Clear the resolvers for this table after notifying all of them
    }
  }
}
