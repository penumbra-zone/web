import 'fake-indexeddb/auto'; // Instanitating ViewServer requires opening up IndexedDb connection
import { describe, expect, it } from 'vitest';
import { IDB_TABLES, IdbConstants } from '@penumbra-zone/types/indexed-db';
import { toBinary } from '@bufbuild/protobuf';
import { FullViewingKeySchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { generateSpendKey, getFullViewingKey } from './keys.js';
import { ViewServer } from '../wasm/index.js';

describe('wasmViewServer', () => {
  it('does not raise zod validation error', async () => {
    const seedPhrase =
      'benefit cherry cannon tooth exhibit law avocado spare tooth that amount pumpkin scene foil tape mobile shine apology add crouch situate sun business explain';

    const spendKey = generateSpendKey(seedPhrase);
    const fullViewingKey = getFullViewingKey(spendKey);
    const idbConstants = {
      name: 'dbName',
      version: 123,
      tables: IDB_TABLES,
    } satisfies IdbConstants;

    const storedTree = {
      hashes: [],
      commitments: [],
      last_forgotten: 0,
      last_position: {
        Position: {
          epoch: 0,
          block: 0,
          commitment: 0,
        },
      },
    };

    const vsServer = ViewServer.new(
      toBinary(FullViewingKeySchema, fullViewingKey),
      storedTree,
      idbConstants,
    );
    await expect(vsServer).resolves.not.toThrow();
  });
});
