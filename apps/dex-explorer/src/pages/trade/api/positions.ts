import { DexService, ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { useQuery } from '@tanstack/react-query';
import {
  Position,
  PositionId,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { AssetId, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { registryQueryFn } from '@/shared/api/registry.ts';
import { isZero } from '@penumbra-zone/types/amount';

export interface Order {
  side: 'Buy' | 'Sell';
  tradeAmount: ValueView;
  effectivePrice: ValueView;
}

export interface PositionData {
  positionId: PositionId;
  positionState: PositionState_PositionStateEnum;
  fee: number;
  orders: Order[];
}

const assetIdToValueView = async (assetId?: AssetId, amount?: Amount) => {
  if (!assetId) {
    throw new Error('No asset id found to convert to ValueView');
  }

  const registry = await registryQueryFn();
  const metadata = registry.tryGetMetadata(assetId);
  if (metadata) {
    return new ValueView({
      valueView: { case: 'knownAssetId', value: { amount, metadata } },
    });
  } else {
    return new ValueView({
      valueView: { case: 'unknownAssetId', value: { amount, assetId } },
    });
  }
};

const getOrders = async (position: Position): Promise<Order[]> => {
  const asset1Id = position.phi?.pair?.asset1;
  const asset1Amount = position.reserves?.r1;

  const asset2Id = position.phi?.pair?.asset2;
  const asset2Amount = position.reserves?.r2;

  const asset1IsPresent = asset1Amount && !isZero(asset1Amount);
  const asset2IsPresent = asset2Amount && !isZero(asset2Amount);

  // TODO: Properly calculate effectivePrice (need to subtract fee)

  // Sell order: Offering to sell asset1
  if (asset1IsPresent && !asset2IsPresent) {
    return [
      {
        side: 'Sell',
        tradeAmount: await assetIdToValueView(asset1Id, asset1Amount),
        effectivePrice: await assetIdToValueView(asset2Id, asset2Amount),
      },
    ];
  }

  // Buy order: Offering to buy asset1
  if (!asset1IsPresent && asset2IsPresent) {
    return [
      {
        side: 'Buy',
        tradeAmount: await assetIdToValueView(asset1Id, asset1Amount),
        effectivePrice: await assetIdToValueView(asset2Id, asset2Amount),
      },
    ];
  }

  // Mixed order: offering to sell both assets
  if (asset1IsPresent && asset2IsPresent) {
    return [
      {
        side: 'Sell',
        tradeAmount: await assetIdToValueView(asset1Id, asset1Amount),
        effectivePrice: await assetIdToValueView(asset2Id, asset2Amount),
      },
      {
        side: 'Sell',
        tradeAmount: await assetIdToValueView(asset2Id, asset2Amount),
        effectivePrice: await assetIdToValueView(asset1Id, asset1Amount),
      },
    ];
  }

  // If no valid orders are found, return an empty array
  return [];
};

export const getPositionData = async (id: PositionId, position: Position) => {
  return {
    positionId: id,
    positionState: position.state?.state ?? PositionState_PositionStateEnum.UNSPECIFIED,
    fee: position.phi?.component?.fee ?? 0,
    orders: await getOrders(position),
  };
};

// 1) Query prax to get position ids
// 2) Take those position ids and get position info from the node
// Context on two-step fetching process: https://github.com/penumbra-zone/penumbra/pull/4837
const fetchQuery = async (): Promise<PositionData[]> => {
  const ownedRes = await Array.fromAsync(penumbra.service(ViewService).ownedPositionIds({}));
  const positionIds = ownedRes.map(r => r.positionId).filter(Boolean) as PositionId[];

  const positionsRes = await Array.fromAsync(
    penumbra.service(DexService).liquidityPositionsById({ positionId: positionIds }),
  );
  if (positionsRes.length !== ownedRes.length) {
    throw new Error('owned id array does not match the length of the positions response');
  }
  const positions = positionsRes.map(r => r.data).filter(Boolean) as Position[];

  const positionData: PositionData[] = [];
  // The responses are in the same order as the requests. Hence, the index matching.
  for (let i = 0; i < positions.length; i++) {
    const id = positionIds[i];
    const position = positions[i];
    if (!id || !position) {
      throw new Error(`No corresponding position or id for index ${i}`);
    }
    const data = await getPositionData(id, position);
    positionData.push(data);
  }

  return positionData;
};

/**
 * Must be used within the `observer` mobX HOC
 */
export const usePositions = () => {
  return useQuery({
    queryKey: ['positions'],
    queryFn: fetchQuery,
    retry: 1,
    enabled: connectionStore.connected,
  });
};

export const stateToString = (state?: PositionState_PositionStateEnum) => {
  switch (state) {
    case PositionState_PositionStateEnum.UNSPECIFIED: {
      return 'Unspecified';
    }
    case PositionState_PositionStateEnum.OPENED: {
      return 'Opened';
    }
    case PositionState_PositionStateEnum.CLOSED: {
      return 'Closed';
    }
    case PositionState_PositionStateEnum.WITHDRAWN: {
      return 'Withdrawn';
    }
    case PositionState_PositionStateEnum.CLAIMED: {
      return 'Claimed';
    }
    case undefined: {
      return 'Unspecified';
    }
  }
};
