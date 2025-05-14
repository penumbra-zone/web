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

/** Get all of the rewards for a specific delegator. */
export async function specificDelegatorRewards(
  address: Serialized<Address>,
  limit?: number,
  page?: number,
): Promise<Serialized<DelegatorReward[]>> {
  const theAddress = deserialize<Address>(address);
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
    .where('address', '=', Buffer.from(theAddress.inner))
    .orderBy('epoch', 'desc')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Kysely limitation
    .$if(limit !== undefined, qb => qb.limit(limit!))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Kyseley limitation
    .$if(page !== undefined && limit !== undefined, qb => qb.offset(page! * limit!))
    .execute();
  const rewards: DelegatorReward[] = result.map(x => ({
    epoch: x.epoch,
    value: new Value({ assetId: STAKING_TOKEN_ASSET_ID, amount: pnum(x.reward).toAmount() }),
    vote: {
      share: x.share,
      asset: new AssetId({ inner: new Uint8Array(x.asset_id) }),
    },
  }));
  return serialize(rewards);
}
