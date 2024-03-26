import { Pool } from "pg";
import { LiquidityPositionEvent } from "./types/lps";
import { bech32ToInner } from "../math/bech32";

export class IndexerQuerier {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  /**
   * @param {string} query - The SQL query string.
   * @returns {Promise<Array<any>>} - The result set of the query as an array.
   */
  private async query(queryText: string, params: any[] = []): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      const res = await client.query(queryText, params);

      // convert timestamps to ISO strings
      res.rows.forEach((row) => {
        Object.keys(row).forEach((key) => {
          if (row[key] instanceof Date) {
            row[key] = row[key].toISOString();
          }
        });
      });

      return this.recursivelyParseJSON(res.rows);
    } finally {
      client.release();
    }
  }

  private recursivelyParseJSON(value: any): any {
    if (typeof value === "string") {
      try {
        // Attempt to parse the string as JSON
        const parsed = JSON.parse(value);
        // If parsing succeeds, continue recursively parsing this object
        return this.recursivelyParseJSON(parsed);
      } catch (error) {
        // If it's not parseable JSON, return the original string
        return value;
      }
    } else if (Array.isArray(value)) {
      // If it's an array, apply recursively to each element
      return value.map((item) => this.recursivelyParseJSON(item));
    } else if (typeof value === "object" && value !== null) {
      // If it's an object, apply recursively to each value
      const parsedObject: { [key: string]: any } = {};
      Object.keys(value).forEach((key) => {
        parsedObject[key] = this.recursivelyParseJSON(value[key]);
      });
      return parsedObject;
    }
    // If none of the above, return the value as is (e.g., numbers, null)
    return value;
  }

  public async fetchLiquidityPositionEventsOnBech32(
    bech32: string
  ): Promise<LiquidityPositionEvent[]> {
    const queryText = `
    SELECT 
      a.event_id,
      e.block_id, 
      e.tx_id,
      e.type,
      jsonb_object_agg(additional_attributes.key, additional_attributes.value) AS lpevent_attributes,
      tr.tx_hash,
      tr.created_at,
      tr.index,
      b.height as block_height
    FROM attributes a
    INNER JOIN events e ON a.event_id = e.rowid
    INNER JOIN tx_events te ON a.value = te.value and te.composite_key = a.composite_key
    INNER JOIN tx_results tr ON e.block_id = tr.block_id and te.index = tr.index
    INNER JOIN block_events b ON e.block_id = b.block_id and b.key = 'height' and b.type = 'block'
    LEFT JOIN attributes additional_attributes ON additional_attributes.event_id = a.event_id
    WHERE a.value = $1 and a.composite_key not like '%EventPositionExecution%' 
    GROUP BY a.event_id, e.block_id, e.tx_id, e.type, tr.tx_hash, tr.created_at, tr.index, b.height;
  `;

    const inner = bech32ToInner(bech32);

    // Use parameterized query to prevent SQL injection
    const res = await this.query(queryText, [`{"inner":"${inner}"}`]);

    return res;
  }

  public async fetchLiquidityPositionExecutionEventsOnBech32(
    bech32: string
  ): Promise<LiquidityPositionEvent[]> {
    const queryText = `
    SELECT 
      a.event_id,
      e.block_id, 
      e.tx_id,
      e.type,
      jsonb_object_agg(additional_attributes.key, additional_attributes.value) AS execution_event_attributes,
      tr.tx_hash,
      tr.created_at,
      tr.index,
      b.height as block_height
    FROM attributes a
    INNER JOIN events e ON a.event_id = e.rowid
    INNER JOIN tx_results tr ON tr.block_id = e.block_id
    INNER JOIN block_events b ON e.block_id = b.block_id and b.key = 'height'
    LEFT JOIN attributes additional_attributes ON additional_attributes.event_id = a.event_id
    WHERE a.value = $1 and a.composite_key like '%EventPositionExecution%' 
    GROUP BY a.event_id, e.block_id, e.tx_id, e.type, tr.tx_hash, tr.created_at, tr.index, b.height;
  `;

    const inner = bech32ToInner(bech32);

    // Use parameterized query to prevent SQL injection
    const res = await this.query(queryText, [`{"inner":"${inner}"}`]);

    return res;
  }

  /**
   * Closes the database connection pool.
   */
  public async close(): Promise<void> {
    await this.pool.end();
  }
}

// Example usage:
// const indexerQuerier = new IndexerQuerier('postgresql://user:password@host:port/database?sslmode=require');
// indexerQuerier.query('SELECT * FROM your_table').then(data => console.log(data)).catch(error => console.error(error));
