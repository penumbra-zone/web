import { NextRequest, NextResponse } from 'next/server';
import { Serialized } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';
import { LqtDelegatorHistory } from '@/shared/database/schema';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';

const DEFAULT_LIMIT = 10;

export interface TournamentDelegatorHistoryRequest {
  limit: number;
  page: number;
  epoch?: number;
}

export interface DelegatorHistoryRequest {
  epochs: string[];
  address: Address;
}

export interface TournamentDelegatorHistoryResponse {
  data: LqtDelegatorHistory[];
  totalRewards: number;
}

export const getQueryParams = (req: NextRequest): TournamentDelegatorHistoryRequest => {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const page = Number(searchParams.get('page')) || 1;

  return {
    limit,
    page,
  };
};

const tournamentDelegatorHistoryQuery = async ({
  limit,
  page,
  epoch,
}: TournamentDelegatorHistoryRequest) => {
  if (!epoch) {
    throw new Error('Missing epoch value field');
  }

  return pindexerDb
    .selectFrom('lqt.delegator_history')
    .orderBy('epoch', 'desc')
    .orderBy('power', 'desc')
    .where('epoch', '=', epoch)
    .limit(limit)
    .offset(limit * (page - 1))
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
): { results: LqtDelegatorHistory[]; totalReward: number } {
  // Create accumulator map to track totals by epoch.
  const matchesByEpoch = new Map<string, { power: number; reward: number; assetId: Buffer }>();

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

  // Create result entries and calculate total reward.
  const results: LqtDelegatorHistory[] = [];
  let totalReward = 0;

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

  return { results, totalReward };
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<Serialized<TournamentDelegatorHistoryResponse | { error: string }>>> {
  const params = getQueryParams(req);

  const data = (await req.json()) as DelegatorHistoryRequest;
  const { epochs, address } = data;
  const targetAddress = bech32mAddress(address);

  // Execute the queries for all epochs concurrently.
  const queryPromises = [...epochs].map(async epoch => {
    const data = await tournamentDelegatorHistoryQuery({
      ...params,
      epoch: Number(epoch),
      limit: 10,
    });
    return {
      epoch,
      data,
    };
  });

  const epochResults = await Promise.all(queryPromises);

  // Return the delegator’s epoch history and the total reward accumulated across all epochs.
  const { results, totalReward } = processEpochResults(epochResults, targetAddress, address);

  return NextResponse.json({
    data: results,
    totalRewards: totalReward,
  });
}
