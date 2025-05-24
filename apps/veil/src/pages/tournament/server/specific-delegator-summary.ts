// The code in this file will have direct access to pindexer.
'use server';

import { pindexerDb } from '@/shared/database/client';
import { deserialize, serialize, Serialized } from '@/shared/utils/serializer';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { sql } from 'kysely';
import { LqtDelegatorSummary } from '@/shared/database/schema';

export interface SpecificDelegatorSummaryRequest {
  address: Address;
}

export interface SpecificDelegatorSummaryData extends Omit<LqtDelegatorSummary, 'address'> {
  address: Address;
}

export interface SpecificDelegatorSummaryResponse {
  data: SpecificDelegatorSummaryData;
}

const delegatorSummaryQuery = async (address: Address) => {
  const ranked = pindexerDb
    .selectFrom('lqt.delegator_summary')
    .select(['address', sql<number>`ROW_NUMBER() OVER (ORDER BY streak DESC)`.as('place')])
    .as('ranked');

  // Return only the row that matches the caller-supplied address.
  return pindexerDb
    .selectFrom('lqt.delegator_summary as summary')
    .innerJoin(ranked, 'ranked.address', 'summary.address')
    .selectAll()
    .where('summary.address', '=', Buffer.from(address.inner))
    .executeTakeFirstOrThrow();
};

/** Get all of the rewards for a specific delegator. */
export async function specificDelegatorSummary(
  request: Serialized<SpecificDelegatorSummaryRequest>,
): Promise<Serialized<SpecificDelegatorSummaryResponse>> {
  const req = deserialize<SpecificDelegatorSummaryRequest>(request);

  const summary = await delegatorSummaryQuery(req.address);

  const plainSummary: SpecificDelegatorSummaryData = {
    ...summary,
    address: new Address({ inner: new Uint8Array(summary.address) }),
    streak: Number(summary.streak),
  };

  return serialize({
    data: plainSummary,
  });
}
