// The code in this file will have direct access to pindexer.
'use server';

import { pindexerDb } from '@/shared/database/client';
import { deserialize, serialize, Serialized } from '@/shared/utils/serializer';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { sql } from 'kysely';
import { DelegatorReward } from '../model/rewards';
import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { STAKING_TOKEN_ASSET_ID } from '@/shared/api/fetch-registry';
import { pnum } from '@penumbra-zone/types/pnum';

export type SortKey = 'epoch' | 'power';

export type SortDirection = 'desc' | 'asc';

export interface SpecificDelegatorRewardsRequest {
  address: Address;
  limit?: number;
  page?: number;
  sortKey?: SortKey;
  sortDirection?: SortDirection;
}

export interface SpecificDelegatorRewardsResponse {
  rewards: DelegatorReward[];
  total: Value;
  count: number;
}

async function fetchRewards(
  address: Address,
  limit?: number,
  page?: number,
  sortKey?: SortKey,
  sortDirection?: SortDirection,
): Promise<DelegatorReward[]> {
  const result = await pindexerDb
    .selectFrom('lqt.delegator_history')
    .select([
      'epoch',
      'asset_id',
      'reward',
      // The power of this delegator in that epoch, divided by the power over the entire epoch.
      // TODO: upstream this into pindexer.
      eb =>
        sql<number>`power / ${eb.fn.sum('power').over(ob => ob.partitionBy('epoch'))}`.as('share'),
    ])
    .where('address', '=', Buffer.from(address.inner))
    .orderBy(sortKey ?? 'epoch', sortDirection ?? 'desc')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Kysely limitation
    .$if(limit !== undefined, qb => qb.limit(limit!))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Kyseley limitation
    .$if(page !== undefined && limit !== undefined, qb => qb.offset(page! * limit!))
    .execute();
  return result.map(x => ({
    epoch: x.epoch,
    value: new Value({ assetId: STAKING_TOKEN_ASSET_ID, amount: pnum(x.reward).toAmount() }),
    vote: {
      share: x.share,
      asset: new AssetId({ inner: new Uint8Array(x.asset_id) }),
    },
  }));
}

async function fetchTotal(address: Address): Promise<{ total: Value; count: number }> {
  const result = await pindexerDb
    .selectFrom('lqt.delegator_history')
    .select([
      eb => eb.fn.sum<number>('reward').as('total'),
      eb => eb.fn.countAll<number>().as('count'),
    ])
    .where('address', '=', Buffer.from(address.inner))
    .executeTakeFirst();
  // For both of these, them being missing indicates them actually being 0.
  const count = result?.count ?? 0;
  const rawTotal = result?.total ?? 0;
  const total = new Value({
    assetId: STAKING_TOKEN_ASSET_ID,
    amount: pnum(rawTotal).toAmount(),
  });
  return { total, count };
}

/** Get all of the rewards for a specific delegator. */
export async function specificDelegatorRewards(
  request: Serialized<SpecificDelegatorRewardsRequest>,
): Promise<Serialized<SpecificDelegatorRewardsResponse>> {
  const req = deserialize<SpecificDelegatorRewardsRequest>(request);
  const [rewards, total] = await Promise.all([
    fetchRewards(req.address, req.limit, req.page, req.sortKey, req.sortDirection),
    fetchTotal(req.address),
  ]);
  return serialize({
    rewards,
    ...total,
  });
}
