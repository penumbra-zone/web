import { Pool, types } from 'pg';
import fs from 'fs';
import { Kysely, PostgresDialect } from 'kysely';
import { DB } from '@/shared/database/schema.ts';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { DurationWindow } from '@/shared/utils/duration.ts';

const MAINNET_CHAIN_ID = 'penumbra-1';

class Pindexer {
  private db: Kysely<DB>;

  constructor() {
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

    this.db = new Kysely<DB>({ dialect });

    const int8TypeId = 20;
    // Map int8 to number.
    types.setTypeParser(int8TypeId, val => {
      return BigInt(val);
    });
  }

  async summary(window: DurationWindow, baseAsset: AssetId, quoteAsset: AssetId) {
    return this.db
      .selectFrom('dex_ex_pairs_summary')
      .selectAll()
      .where('the_window', '=', window)
      .where('asset_start', '=', Buffer.from(baseAsset.inner))
      .where('asset_end', '=', Buffer.from(quoteAsset.inner))
      .execute();
  }

  async candles({
    baseAsset,
    quoteAsset,
    window,
    chainId,
  }: {
    baseAsset: AssetId;
    quoteAsset: AssetId;
    window: DurationWindow;
    chainId: string;
  }) {
    let query = this.db
      .selectFrom('dex_ex_price_charts')
      .select(['start_time', 'open', 'close', 'low', 'high', 'swap_volume', 'direct_volume'])
      .where('the_window', '=', window)
      .where('asset_start', '=', Buffer.from(baseAsset.inner))
      .where('asset_end', '=', Buffer.from(quoteAsset.inner))
      .orderBy('start_time', 'asc');

    // Due to a lot of price volatility at the launch of the chain, manually setting start date a few days later
    if (chainId === MAINNET_CHAIN_ID) {
      query = query.where('start_time', '>=', new Date('2024-08-06'));
    }

    return query.execute();
  }
}

export const pindexer = new Pindexer();
