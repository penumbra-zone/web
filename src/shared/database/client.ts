import fs from 'fs';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool, types } from 'pg';
import { DB } from './schema';

/** Server-side function to create a typed instance of the Pindexer database. */
const createPindexerClient = () => {
  const ca = process.env['PENUMBRA_INDEXER_CA_CERT'];
  const connectionString = process.env['PENUMBRA_INDEXER_ENDPOINT'];
  const dbConfig = {
    connectionString: connectionString,
    ...(ca && {
      ssl: {
        rejectUnauthorized: true,
        ca: ca.startsWith('-----BEGIN CERTIFICATE-----') ? ca : fs.readFileSync(ca, 'utf-8'),
      },
    }),
  };
  const dialect = new PostgresDialect({
    pool: new Pool(dbConfig),
  });

  const int8TypeId = 20;
  // Map int8 to number.
  types.setTypeParser(int8TypeId, val => {
    return BigInt(val);
  });

  return new Kysely<DB>({ dialect });
};

/** A typed instance of the Pindexer database. Can be queried with Kysely */
export const pindexerDb = createPindexerClient();
