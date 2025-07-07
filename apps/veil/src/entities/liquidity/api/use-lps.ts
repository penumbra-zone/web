import { penumbra } from '@/shared/const/penumbra';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { useQuery } from '@tanstack/react-query';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { LpPositionBundleResponse_Entry } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  PositionMetadata,
  PositionState,
  TradingPair,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

/**
 * Must be used within the `observer` mobX HOC
 */
export const useLps = ({
  subaccount,
  positionMetadata,
  positionState,
  tradingPair,
}: {
  subaccount: number;
  positionMetadata?: PositionMetadata;
  positionState?: PositionState;
  tradingPair?: TradingPair;
}) => {
  const { data: positionStrategyBundles } = useQuery({
    queryKey: ['lp-position-bundle', subaccount],
    queryFn: async () => {
      const stream = penumbra.service(ViewService).lpPositionBundle({
        subaccount: new AddressIndex({ account: subaccount }),
        positionMetadata,
        positionState,
        tradingPair,
      });

      const entries: LpPositionBundleResponse_Entry[] = [];
      for await (const response of stream) {
        entries.push(...response.entries);
      }

      return entries;
    },
  });

  return positionStrategyBundles;
};
