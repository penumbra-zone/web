// The code in this file will have direct access to pindexer.
'use server';

import { pindexerDb } from '@/shared/database/client';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
export interface DelegatorStreakData {
  address: Address;
  streak: number;
}

export interface DelegatorStreaksResponse {
  data: DelegatorStreakData[];
}

const delegatorSummaryQuery = async () => {
  return pindexerDb.selectFrom('lqt.delegator_summary').select(['address', 'streak']).execute();
};

/** Get all of the rewards for a specific delegator. */
export async function specificDelegatorSummary(): Promise<Serialized<DelegatorStreaksResponse>> {
  const summaries = await delegatorSummaryQuery();

  const delegatorStreaks: DelegatorStreakData[] = summaries.map(summary => ({
    address: new Address({ inner: new Uint8Array(summary.address) }),
    streak: Number(summary.streak),
  }));

  return serialize({
    data: delegatorStreaks,
  });
}
