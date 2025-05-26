import { NextRequest, NextResponse } from 'next/server';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Serialized, serialize } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';
import { LqtDelegatorHistory } from '@/shared/database/schema';
import { BASE_LIMIT, BASE_PAGE } from '../api/use-personal-rewards';

export const SORT_KEYS = ['epoch', 'reward'] as const;
export type DelegatorHistorySortKey = (typeof SORT_KEYS)[number];

export const DIRECTIONS = ['asc', 'desc'] as const;
export type DelegatorHistorySortDirection = (typeof DIRECTIONS)[number];

export interface DelegatorHistoryRequest {
  epochs: string[];
  limit?: number;
  page?: number;
  sortKey?: DelegatorHistorySortKey;
  sortDirection?: DelegatorHistorySortDirection;
}

export interface TournamentDelegatorHistoryResponse {
  address: Address;
  total_items: number;
  total_rewards: number;
  data: LqtDelegatorHistoryData[];
}

export interface LqtDelegatorHistoryData extends Omit<LqtDelegatorHistory, 'address' | 'asset_id'> {
  address: Address;
  asset_id: AssetId;
}

export const getBodyParams = async (
  req: NextRequest,
): Promise<Required<DelegatorHistoryRequest> | string> => {
  const body = (await req.json()) as DelegatorHistoryRequest;

  const limit = Number(body.limit) || BASE_LIMIT;
  const page = Number(body.page) || BASE_PAGE;

  const sortKeyParam = body.sortKey;
  const sortKey = sortKeyParam && SORT_KEYS.includes(sortKeyParam) ? sortKeyParam : 'epoch';

  const sortDirectionParam = body.sortDirection;
  const sortDirection =
    sortDirectionParam && DIRECTIONS.includes(sortDirectionParam) ? sortDirectionParam : 'desc';

  const epochs = Array.isArray(body.epochs) ? body.epochs : [];

  return {
    limit,
    page,
    sortKey,
    sortDirection,
    epochs,
  };
};

const tournamentDelegatorHistoryQuery = async ({
  epochs,
  sortKey,
  sortDirection,
  limit,
  page,
}: Required<DelegatorHistoryRequest>) => {
  // take all rows from delegator history in a set of epochs
  const filteredQuery = pindexerDb
    .selectFrom('lqt.delegator_history')
    .selectAll()
    .where(
      'epoch',
      'in',
      epochs.map(epoch => Number(epoch)),
    );

  // group by delegator address and calculate total items and rewards, so that frontend only needs
  // to filter the resulting array by address to find their own history.
  const aggregated = pindexerDb
    .selectFrom(filteredQuery.as('grouped'))
    .groupBy('address')
    .select(eb => [
      'address',
      eb.fn.countAll().as('total_items'),
      eb.fn.sum('reward').as('total_rewards'),
      // all rows for each address are aggregated into a single array with correct ordering and limits
      jsonArrayFrom(
        eb
          .selectFrom(filteredQuery.as('delegators'))
          .selectAll()
          .whereRef('delegators.address', '=', 'grouped.address')
          .orderBy(sortKey, sortDirection)
          .limit(limit)
          .offset(limit * (page - 1)),
      ).as('data'),
    ]);

  return aggregated.execute();
};

export async function POST(
  req: NextRequest,
): Promise<NextResponse<Serialized<TournamentDelegatorHistoryResponse[] | { error: string }>>> {
  const params = await getBodyParams(req);
  if (typeof params === 'string') {
    return NextResponse.json({ error: params }, { status: 400 });
  }

  const result = await tournamentDelegatorHistoryQuery(params);
  const history = await Promise.all(
    result.map(historyByAddress => {
      return {
        address: new Address({ inner: historyByAddress.address }),
        total_items: Number(historyByAddress.total_items),
        total_rewards: Number(historyByAddress.total_rewards),
        data: historyByAddress.data.map<LqtDelegatorHistoryData>(item => ({
          epoch: item.epoch,
          power: Number(item.power),
          reward: Number(item.reward),
          address: new Address({ inner: item.address }),
          asset_id: new AssetId({ inner: Uint8Array.from(item.asset_id) }),
        })),
      };
    }),
  );

  return NextResponse.json(serialize(history));
}
