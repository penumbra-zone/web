import { Pool, QueryConfigValues, QueryResultRow } from 'pg';
import fs from 'fs';
import { BlockInfo } from './lps';
import { JsonValue } from '@bufbuild/protobuf';

const INDEXER_CERT = process.env['PENUMBRA_INDEXER_CA_CERT'];

// TODO: Delete when possible, this is deprecated
export class IndexerQuerier {
  private pool: Pool;

  constructor(connectionString: string) {
    const dbConfig = {
      connectionString: connectionString,
      // If a CA certificate was specified as an env var, pass that info to the database config.
      // Be advised that if PENUMBRA_INDEXER_CA_CERT is set, then PENUMBRA_INDEXER_ENDPOINT must
      // *lack* an `sslmode` param! This is documented here:
      // https://node-postgres.com/features/ssl#usage-with-connectionstring
      ...(INDEXER_CERT && {
        ssl: {
          rejectUnauthorized: true,
          ca: INDEXER_CERT.startsWith('-----BEGIN CERTIFICATE-----')
            ? INDEXER_CERT
            : fs.readFileSync(INDEXER_CERT, 'utf-8'),
        },
      }),
    };
    this.pool = new Pool(dbConfig);
  }

  /**
   * @param {string} query - The SQL query string.
   * @returns {Promise<Array<any>>} - The result set of the query as an array.
   */
  private async query<P, T>(queryText: string, params: QueryConfigValues<P>): Promise<T> {
    const client = await this.pool.connect();
    try {
      const res = await client.query<QueryResultRow, P>(queryText, params);

      // TODO: This feels like a bad pattern
      // convert timestamps to ISO strings
      res.rows.forEach(row => {
        Object.keys(row).forEach(key => {
          if (row[key] instanceof Date) {
            row[key] = row[key].toISOString();
          }
        });
      });

      return this.recursivelyParseJSON(res.rows) as T;
    } finally {
      client.release();
    }
  }

  private recursivelyParseJSON(value: JsonValue): JsonValue {
    if (typeof value === 'string') {
      try {
        // Attempt to parse the string as JSON
        const parsed = JSON.parse(value) as JsonValue;
        // If parsing succeeds, continue recursively parsing this object
        return this.recursivelyParseJSON(parsed);
      } catch (error) {
        // If it's not parseable JSON, return the original string
        return value;
      }
    } else if (Array.isArray(value)) {
      // If it's an array, apply recursively to each element
      return value.map(item => this.recursivelyParseJSON(item));
    } else if (typeof value === 'object' && value !== null) {
      // If it's an object, apply recursively to each value
      const parsedObject: Record<string, JsonValue> = {};
      for (const key of Object.keys(value)) {
        const fieldValue = value[key];
        if (fieldValue === undefined) {
          continue;
        }
        parsedObject[key] = this.recursivelyParseJSON(fieldValue);
      }
      return parsedObject as JsonValue;
    }
    // If none of the above, return the value as is (e.g., numbers, null)
    return value;
  }

  public async fetchMostRecentNBlocks(n: number): Promise<BlockInfo[]> {
    const queryText = `
    SELECT
      height,
      created_at
    FROM blocks
    ORDER BY height DESC
    LIMIT $1;
    `;
    return await this.query(queryText, [`${n}`]);
  }

  public async fetchBlocksByHeight(heights: number[]): Promise<BlockInfo[]> {
    const queryText = `
    SELECT
      height,
      created_at
    FROM blocks
    WHERE height = ANY($1)
    ORDER BY height DESC
    `;
    return this.query(queryText, [heights]);
  }

  /**
   * Closes the database connection pool.
   */
  public async close(): Promise<void> {
    await this.pool.end();
  }
}
