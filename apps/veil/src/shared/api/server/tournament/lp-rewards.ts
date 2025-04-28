import { NextRequest, NextResponse } from 'next/server';
// import { JsonObject } from '@bufbuild/protobuf';
// import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';
import { sql } from 'kysely';

const SORT_KEYS = ['epoch', 'position_id', 'reward', ''] as const;
export type LpRewardsSortKey = (typeof SORT_KEYS)[number];

const DIRECTIONS = ['asc', 'desc'] as const;
export type LpRewardsSortDirection = (typeof DIRECTIONS)[number];

export interface LpRewardsRequest {
  limit: number;
  page: number;
  sortKey: LpRewardsSortKey;
  sortDirection: LpRewardsSortDirection;
}

// export interface LpRewardsData
//   extends Omit<LpRewardsSummary, 'address' | 'epochs_voted_in'> {
//   place: number;
//   epochs_voted_in: number;
//   address: Address;
// }

export interface LpRewardsApiResponse {
  total: number;
  data: any[];
}

function queryLqtLps() {
  return pindexerDb
    .selectFrom(sql`lqt.lps as lps`)
    .innerJoin('dex_ex_position_state as state', 'lps.position_id', 'state.position_id')
    .selectAll('lps')
    .selectAll('state')
    .execute();
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<Serialized<LpRewardsApiResponse>>> {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    return NextResponse.json({ error: 'PENUMBRA_CHAIN_ID is not set' }, { status: 500 });
  }

  const registryClient = new ChainRegistryClient();

  const [registry, results] = await Promise.all([
    registryClient.remote.get(chainId),
    queryLqtLps(),
  ]);

  return NextResponse.json(serialize(transformed));
}
