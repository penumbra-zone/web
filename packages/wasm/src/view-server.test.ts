import 'fake-indexeddb/auto'; // Instanitating ViewServer requires opening up IndexedDb connection
import { describe, expect, it, vi } from 'vitest';
import { generateSpendKey, getFullViewingKey } from './keys';
import { ViewServer } from '@penumbra-zone/wasm-nodejs';
import { IDB_TABLES, IdbConstants } from '@penumbra-zone/types';

// Replace the wasm-pack import with the nodejs version so tests can run
vi.mock('@penumbra-zone/wasm-bundler', () => vi.importActual('@penumbra-zone/wasm-nodejs'));

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

    const vsServer = ViewServer.new(fullViewingKey, 719n, storedTree, idbConstants);
    await expect(vsServer).resolves.not.toThrow();
  });
});
