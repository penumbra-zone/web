import { NextRequest, NextResponse } from 'next/server';
import { Serialized, serialize } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';
import { LqtDelegatorHistory } from '@/shared/database/schema';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { chainRegistryClient } from '@/shared/api/registry';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export const SORT_KEYS = ['epoch', 'power', 'reward', ''] as const;
export type DelegatorHistorySortKey = (typeof SORT_KEYS)[number];

export const DIRECTIONS = ['asc', 'desc'] as const;
export type DelegatorHistorySortDirection = (typeof DIRECTIONS)[number];

export interface DelegatorHistoryRequest {
  epochs: string[];
  address: Address;
  limit?: number;
  page?: number;
  sortKey?: DelegatorHistorySortKey;
  sortDirection?: DelegatorHistorySortDirection;
}

export interface TournamentDelegatorHistoryResponse {
  data: LqtDelegatorHistoryData[];
  totalItems: number;
  totalRewards: number;
}

export interface LqtDelegatorHistoryData extends Omit<LqtDelegatorHistory, 'address' | 'asset_id'> {
  address: Address;
  asset_id: AssetId;
  metadata: Metadata;
}

const tournamentDelegatorHistoryQuery = async ({ epoch }: { epoch: number }) => {
  return pindexerDb
    .selectFrom('lqt.delegator_history')
    .orderBy('epoch', 'desc')
    .orderBy('power', 'desc')
    .where('epoch', '=', epoch)
    .selectAll()
    .execute();
};

/**
 * Consolidate per-epoch query results into a single history for the given
 * delegator address.
 *
 * For each epoch we:
 *    * filter rows belonging to the delegator,
 *    * tally their total voting power,
 *    * capture that epoch’s reward and asset id.
 *
 * Finally, we aggregate the rewards earned by the address across all epochs.
 */
function processEpochResults(
  epochResults: {
    epoch: string;
    data: { address: Buffer; epoch: number; power: number; asset_id: Buffer; reward: number }[];
  }[],
  targetAddress: string,
  address: Address,
  limit: number,
  page: number,
  sortKey: DelegatorHistorySortKey = 'epoch',
  sortDirection: DelegatorHistorySortDirection = 'desc',
): { paginatedResults: LqtDelegatorHistory[]; totalItems: number; totalReward: number } {
  // Create accumulator for results
  const matchesByEpoch = new Map<string, { power: number; reward: number; assetId: Buffer }>();

  // Create result entries and calculate total reward.
  const results: LqtDelegatorHistory[] = [];
  let totalReward = 0;

  for (const { epoch, data } of epochResults) {
    // Find all matching items for this epoch.
    const matches = data.filter(
      item => bech32mAddress(new Address({ inner: item.address })) === targetAddress,
    );

    if (matches.length > 0 && matches[0]) {
      // Calculate total power for matches, and store first match's reward and asset_id.
      const totalPower = matches.reduce((sum, item) => sum + Number(item.power), 0);
      matchesByEpoch.set(epoch, {
        power: totalPower,
        reward: Number(matches[0].reward),
        assetId: matches[0].asset_id,
      });
    }
  }

  for (const [epoch, match] of matchesByEpoch.entries()) {
    results.push({
      address: Buffer.from(address.inner),
      epoch: parseInt(epoch, 10),
      power: match.power,
      asset_id: Buffer.from(match.assetId),
      reward: match.reward,
    });

    totalReward += match.reward;
  }

  // We need to perform pagination after fetching all data from pindexer,
  // since we require the total count. This is the correct approach for
  // implementing server-side pagination while preserving accurate totals and sorting.
  results.sort((a, b) => {
    if (sortKey === 'epoch') {
      const comparison = a.epoch - b.epoch;
      return sortDirection === 'asc' ? comparison : -comparison;
    }

    // fallback (no-op)
    return 0;
  });

  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, Math.min(startIndex + limit, results.length));

  return {
    paginatedResults,
    totalItems: results.length,
    totalReward,
  };
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<Serialized<TournamentDelegatorHistoryResponse | { error: string }>>> {
  const data = (await req.json()) as DelegatorHistoryRequest;
  const {
    epochs,
    address,
    limit = BASE_LIMIT,
    page = BASE_PAGE,
    sortKey = 'epoch',
    sortDirection = 'desc',
  } = data;

  const targetAddress = bech32mAddress(address);

  // Execute the queries for all epochs concurrently
  const queryPromises = [...epochs].map(async epoch => {
    const data = await tournamentDelegatorHistoryQuery({
      epoch: Number(epoch),
    });
    return {
      epoch,
      data,
    };
  });

  const epochResults = await Promise.all(queryPromises);

  // Return the delegator’s epoch history and the total reward accumulated across all epochs.
  const { paginatedResults, totalItems, totalReward } = processEpochResults(
    epochResults,
    targetAddress,
    address,
    limit,
    page,
    sortKey,
    sortDirection,
  );

  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    return NextResponse.json({ error: 'Error: PENUMBRA_CHAIN_ID is not set' }, { status: 500 });
  }

  const registryClient = new ChainRegistryClient();
  const registry = await registryClient.remote.get(chainId);

  // Map only the paginated results with metadata
  const mapped = await Promise.all(
    paginatedResults.map(item => {
      // TODO: remove hardcoded staking asset metadata when registry is fixed
      const { stakingAssetId } = chainRegistryClient.bundled.globals();
      const asset_id = new AssetId({ inner: Uint8Array.from(item.asset_id) });
      const metadata = registry.tryGetMetadata(stakingAssetId);

      if (!metadata) {
        return undefined;
      }

      return {
        address: new Address({ inner: item.address }),
        epoch: item.epoch,
        power: item.power,
        asset_id,
        reward: item.reward,
        metadata,
      };
    }),
  );

  const filteredMapped = mapped.filter(Boolean) as LqtDelegatorHistoryData[];

  return NextResponse.json({
    data: serialize(filteredMapped),
    totalItems: totalItems,
    totalRewards: Number(totalReward),
  });
}
