import { PenumbraDb } from '@penumbra-zone/types/indexed-db';
import { StoreKey, StoreNames } from 'idb';

interface IdbUpdate<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>> {
  store: StoreName;
  key: StoreKey<DBTypes, StoreName>;
}

interface IdbUpdateEventInterface<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>
  extends CustomEvent<IdbUpdate<DBTypes, StoreName>> {
  new <T extends 'idb-update'>(
    type: T,
    init: IdbUpdate<DBTypes, StoreName>,
  ): CustomEvent<IdbUpdate<DBTypes, StoreName>>;
}

export class IdbUpdateEvent<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>
  extends CustomEvent<IdbUpdate<DBTypes, StoreName>>
  implements IdbUpdateEventInterface<DBTypes, StoreName>
{
  constructor(type: 'idb-update', init: IdbUpdate<DBTypes, StoreName>) {
    super(type, { detail: init });
  }
}
