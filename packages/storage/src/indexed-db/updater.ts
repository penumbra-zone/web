import { PenumbraDb } from 'penumbra-types';
import { StoreKey, StoreNames, StoreValue } from 'idb/build/entry';
import { IDBPDatabase } from 'idb';

export type TableUpdateNotifier =
  | IdbUpdateNotifier<PenumbraDb, 'LAST_BLOCK_SYNCED'>
  | IdbUpdateNotifier<PenumbraDb, 'TREE_LAST_POSITION'>
  | IdbUpdateNotifier<PenumbraDb, 'TREE_LAST_FORGOTTEN'>
  | IdbUpdateNotifier<PenumbraDb, 'TREE_HASHES'>
  | IdbUpdateNotifier<PenumbraDb, 'TREE_COMMITMENTS'>
  | IdbUpdateNotifier<PenumbraDb, 'ASSETS'>
  | IdbUpdateNotifier<PenumbraDb, 'SPENDABLE_NOTES'>;

export interface IdbUpdateNotifier<
  DBTypes extends PenumbraDb,
  StoreName extends StoreNames<DBTypes>,
> {
  table: StoreName;
  handler: (
    value: StoreValue<DBTypes, StoreName>,
    key?: StoreKey<DBTypes, StoreName> | IDBKeyRange,
  ) => Promise<void>;
}

export interface IdbUpdate<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>> {
  table: StoreName;
  value: StoreValue<DBTypes, StoreName>;
  key?: StoreKey<DBTypes, StoreName> | IDBKeyRange;
}

export class IbdUpdates {
  constructor(readonly all: IdbUpdate<PenumbraDb, StoreNames<PenumbraDb>>[] = []) {}

  add<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>(
    update: IdbUpdate<DBTypes, StoreName>,
  ) {
    this.all.push(update);
  }
}

export class IbdUpdater {
  constructor(
    private readonly db: IDBPDatabase<PenumbraDb>,
    private readonly updateNotifiers?: TableUpdateNotifier[],
  ) {}

  async updateAll(updates: IbdUpdates): Promise<void> {
    const tables = updates.all.map(u => u.table);
    const tx = this.db.transaction(tables, 'readwrite');

    for (const update of updates.all) {
      await tx.objectStore(update.table).put(update.value, update.key);
    }

    await tx.done;

    // Notify subscribers of the particular tables about the updates
    for (const update of updates.all) {
      this.updateNotifiers
        ?.filter(n => n.table === update.table)
        .forEach(n => {
          // @ts-expect-error typescript believes `update.value` is a never
          void n.handler(update.value, update.key);
        });
    }
  }

  async update<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>(
    update: IdbUpdate<DBTypes, StoreName>,
  ): Promise<void> {
    const updates = new IbdUpdates();
    updates.add(update);
    await this.updateAll(updates);
  }
}
