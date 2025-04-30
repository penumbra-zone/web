import { sql } from 'kysely';
import { NextRequest, NextResponse } from 'next/server';
// import { JsonObject } from '@bufbuild/protobuf';
// import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';

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

function queryLqtLps(positionIds: string[]) {
  return (
    pindexerDb
      .selectFrom('lqt.lps')
      // .innerJoin('dex_ex_position_state as state', 'lps.position_id', 'state.position_id')
      .where('lqt.lps.position_id', 'in', [
        ...positionIds,
        '212F57D974F2068878C22AF929A5ED77B209C1065ED4AAACDC51C918BAC747E0',
      ])
      .selectAll('lqt.lps')
      .execute()
  );
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<Serialized<LpRewardsApiResponse>>> {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  console.log('TCL: chainId', chainId);
  if (!chainId) {
    return NextResponse.json({ error: 'PENUMBRA_CHAIN_ID is not set' }, { status: 500 });
  }

  const params = await req.json();

  const results = await queryLqtLps(params.positionIds);

  console.log('TCL: results', results);

  return NextResponse.json(serialize(transformed));
}
