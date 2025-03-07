import { createClient } from '@connectrpc/connect';
import { SimulateTradeRequest } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { SimulationService } from '@penumbra-zone/protobuf';
import { pnum } from '@penumbra-zone/types/pnum';
import { openToast } from '@penumbra-zone/ui/Toast';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { getGrpcTransport } from '@/shared/api/transport';
import { toValueView } from '@/shared/utils/value-view';
import { AssetInfo } from '../../../model/AssetInfo';
import { calculatePriceImpact } from './calculate-price-impact';
import { Direction } from './types';

export interface EstimationResult {
  amount: number;
  unfilled?: ValueView;
  priceImpact?: number;
}

/**
 * Simulates the transaction with given input and output assets.
 * Works for both connected and disconnected accounts but must be used within MobX store.
 */
export const estimateAmount = async (
  from: AssetInfo,
  to: AssetInfo,
  input: number,
  direction: Direction,
): Promise<EstimationResult | undefined> => {
  try {
    const grpc = !connectionStore.connected ? await getGrpcTransport() : undefined;

    const req = new SimulateTradeRequest({
      input: from.value(input),
      output: to.id,
    });

    const res = grpc
      ? await createClient(SimulationService, grpc.transport).simulateTrade(req)
      : await penumbra.service(SimulationService).simulateTrade(req);

    const amount = res.output?.output?.amount;
    if (amount === undefined) {
      throw new Error('Amount returned from swap simulation was undefined');
    }

    const unfilled =
      res.unfilled?.amount &&
      res.unfilled.assetId &&
      (res.unfilled.amount.hi !== 0n || res.unfilled.amount.lo !== 0n)
        ? toValueView({
            amount: pnum(res.unfilled.amount).toNumber(),
            metadata: direction === 'buy' ? to.metadata : from.metadata,
          })
        : undefined;

    // Calculate the price impact with the correct sign based on direction
    let priceImpact = calculatePriceImpact(res.output);
    if (priceImpact) {
      priceImpact = Math.abs(priceImpact) * (direction === 'buy' ? 1 : -1);
    }

    return {
      unfilled,
      priceImpact,
      amount: pnum(amount, to.exponent).toNumber(),
    };
  } catch (e) {
    if (
      e instanceof Error &&
      ![
        'ConnectError',
        'PenumbraNotInstalledError',
        'PenumbraProviderNotAvailableError',
        'PenumbraProviderNotConnectedError',
      ].includes(e.name)
    ) {
      openToast({
        type: 'error',
        message: e.name,
        description: e.message,
      });
    }
    return undefined;
  }
};
