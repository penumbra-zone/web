import 'fake-indexeddb/auto'; // Instanitating ViewServer requires opening up IndexedDb connection
import { describe, expect, it } from 'vitest';
import { ViewServer } from '../wasm/index.js';
import { IDB_TABLES, IdbConstants } from '@penumbra-zone/types/indexed-db';

const fullViewingKeyPb = new Uint8Array([
  10, 64, 218, 166, 215, 157, 16, 116, 202, 251, 54, 137, 60, 58, 134, 204, 156, 227, 115, 97, 122,
  78, 26, 33, 205, 72, 217, 122, 232, 65, 34, 150, 199, 15, 42, 215, 127, 66, 32, 106, 171, 94, 195,
  51, 232, 13, 170, 107, 186, 139, 125, 19, 186, 12, 176, 19, 64, 182, 45, 111, 148, 214, 6, 10,
  176, 4,
]);

describe('wasmViewServer', () => {
  it('does not raise zod validation error', async () => {
    const idbConstants = {
      name: 'dbName',
      version: 123,
      tables: IDB_TABLES,
    } satisfies IdbConstants;

    const vsServer = ViewServer.new(fullViewingKeyPb, 0n, 0n, [], [], idbConstants);
    await expect(vsServer).resolves.not.toThrow();
  });
});
