import { DBSchema, IDBPDatabase, StoreKey, StoreNames, StoreValue } from 'idb';

export interface IDBUpdate<S extends DBSchema, N extends StoreNames<S> = StoreNames<S>> {
  table: N;
  value: StoreValue<S, N>;
  key?: StoreKey<S, N> | IDBKeyRange;
}

type IDBResolver<S extends DBSchema, N extends StoreNames<S> = StoreNames<S>> = (
  value: IDBUpdate<S, N>,
) => void;

export class IDBUpdater<S extends DBSchema> {
  private readonly subscribers: Map<StoreNames<S>, IDBResolver<S>[]>;

  constructor(private readonly db: IDBPDatabase<S>) {
    this.subscribers = new Map();
  }

  subscribe<N extends StoreNames<S>>(
    table: N,
    abortSignal?: AbortSignal,
  ): AsyncGenerator<IDBUpdate<S, N>, void> {
    const subscription = async function* (
      subs: Map<N, IDBResolver<S, N>[]>,
      abortSignal?: AbortSignal,
    ) {
      while (!abortSignal?.aborted) {
        yield await new Promise<IDBUpdate<S, N>>(resolve => {
          const resolversForTable = subs.get(table) ?? [];
          resolversForTable.push(resolve);
          subs.set(table, resolversForTable);
        });
      }
    };

    return subscription(this.subscribers as Map<N, IDBResolver<S, N>[]>, abortSignal);
  }

  async updateAll(updates: IDBUpdate<S>[]): Promise<void> {
    const affectedTables = updates.map(({ table }) => table);
    const tx = this.db.transaction(affectedTables, 'readwrite');

    for (const up of updates) {
      await tx.objectStore(up.table).put(up.value, up.key);
      this.notifySubscribers(up);
    }

    await tx.done;
  }

  async update(update: IDBUpdate<S>): Promise<void> {
    await this.updateAll([update]);
  }

  private notifySubscribers(update: IDBUpdate<S>) {
    const resolversForTable = this.subscribers.get(update.table);
    // Clear the resolvers we are about to notify
    this.subscribers.set(update.table, []);
    if (resolversForTable) {
      for (const resolve of resolversForTable) {
        resolve(update);
      }
    }
  }
}
