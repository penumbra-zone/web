import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import {
  Position,
  PositionId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';

export const ownedPositionIds: Impl['ownedPositionIds'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);

  const { indexedDb } = await services.getWalletServices();

  const responses: { positionId: PositionId }[] = [];
  for await (const positionRecord of indexedDb.iteratePositions()) {
    const position = Position.fromJson(positionRecord.position);

    if (req.positionState && !req.positionState.equals(position.state)) {
      continue;
    }
    if (req.tradingPair && !req.tradingPair.equals(position.phi?.pair)) {
      continue;
    }
    responses.push({ positionId: PositionId.fromJson(positionRecord.id) });
  }
  // direct streaming from indexed-db is not supported because it leads to premature closing of IDB transaction
  for (const response of responses) {
    yield response;
  }
};
