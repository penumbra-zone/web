// import { DexService, ViewService } from '@penumbra-zone/protobuf';
// import { penumbra } from '@/shared/const/penumbra';
// import { connectionStore } from '@/shared/model/connection';
// import { useInfiniteQuery } from '@tanstack/react-query';
// import {
//   Position,
//   PositionId,
//   PositionState,
//   PositionState_PositionStateEnum,
// } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
// import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
// import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
// import { queryClient } from '@/shared/const/queryClient';
// import { limitAsync } from '@/shared/utils/limit-async';
// import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

import {
  TradingPair,
  // PositionMetadata,
  PositionState,
  PositionId,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
// import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { UseQueryResult } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export interface LpPositionBundleResponse {
  entries: LpPositionBundleResponseEntry[];
}

export interface LpPositionBundleResponseEntry {
  // The trading pair for which this strategy is defined.
  trading_pair: TradingPair;

  // The subaccount index for which this strategy is defined.
  subaccount: AddressIndex;

  // The LP strategy metadata.
  // position_metadata: PositionMetadata;
  position_metadata: 'Pyramid' | 'Inverted Pyramid' | 'Flat' | null;

  // The strategy state (e.g., open, closed, etc.).
  position_state: PositionState;

  // The position id(s) for the LP strategy.
  position_id: PositionId[];
}

/**
 * Must be used within the `observer` mobX HOC
 */
export const useLps = (subaccount = 0): UseQueryResult<LpPositionBundleResponse['entries']> => {
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    // @TODO use ViewService to get position bundles
    if (!Number.isNaN(subaccount)) {
      setTimeout(() => {
        setLoading(true);
      }, 1000);
    }
  }, [subaccount]);

  return {
    isLoading,
    data: [],
  };
};
