import { pindexer } from '@/shared/database';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import { PositionStateResponse } from '@/shared/api/server/position/timeline/types.ts';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

export const getPositionState = async (id: PositionId): Promise<PositionStateResponse> => {
  const result = await pindexer.getPositionState(id);
  if (!result) {
    throw new Error('Position state not found');
  }

  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    throw new Error('PENUMBRA_CHAIN_ID is not set');
  }

  const registryClient = new ChainRegistryClient();
  const registry = await registryClient.remote.get(chainId);

  const assetId1 = new AssetId({ inner: Uint8Array.from(result.state.asset_1) });
  const assetId2 = new AssetId({ inner: Uint8Array.from(result.state.asset_2) });

  const asset1Metadata = registry.getMetadata(assetId1);
  const asset2Metadata = registry.getMetadata(assetId2);

  const unit1Amount = Math.pow(10, getDisplayDenomExponent(asset1Metadata));
  const unit2Amount = Math.pow(10, getDisplayDenomExponent(asset2Metadata));

  const offer1Amount = Math.floor(
    (1 / result.state.effective_price_2_to_1) * Number(result.latestReserves.reserves_2),
  );
  const offer2Amount = Math.floor(
    (1 / result.state.effective_price_1_to_2) * Number(result.latestReserves.reserves_1),
  );
  const priceRef1Amount = Math.floor((1 / result.state.effective_price_2_to_1) * unit2Amount);
  const priceRef1AmountInv = Math.floor(result.state.effective_price_2_to_1 * unit1Amount);
  const priceRef2Amount = Math.floor((1 / result.state.effective_price_1_to_2) * unit1Amount);
  const priceRef2AmountInv = Math.floor(result.state.effective_price_1_to_2 * unit2Amount);

  const response: PositionStateResponse = {
    feeBps: result.state.fee_bps,
    openingReserves1: new Value({
      assetId: assetId1,
      amount: pnum(result.state.reserves_1).toAmount(),
    }),
    openingReserves2: new Value({
      assetId: assetId2,
      amount: pnum(result.state.reserves_2).toAmount(),
    }),
    currentReserves1: new Value({
      assetId: assetId1,
      amount: pnum(result.latestReserves.reserves_1).toAmount(),
    }),
    currentReserves2: new Value({
      assetId: assetId2,
      amount: pnum(result.latestReserves.reserves_2).toAmount(),
    }),
    unit1: new Value({
      assetId: assetId1,
      amount: pnum(unit1Amount).toAmount(),
    }),
    unit2: new Value({
      assetId: assetId2,
      amount: pnum(unit2Amount).toAmount(),
    }),
    offer1: new Value({
      assetId: assetId1,
      amount: pnum(offer1Amount).toAmount(),
    }),
    offer2: new Value({
      assetId: assetId2,
      amount: pnum(offer2Amount).toAmount(),
    }),
    priceRef1: new Value({
      assetId: assetId1,
      amount: pnum(priceRef1Amount).toAmount(),
    }),
    priceRef2: new Value({
      assetId: assetId2,
      amount: pnum(priceRef2Amount).toAmount(),
    }),
    priceRef1Inv: new Value({
      assetId: assetId2,
      amount: pnum(priceRef1AmountInv).toAmount(),
    }),
    priceRef2Inv: new Value({
      assetId: assetId1,
      amount: pnum(priceRef2AmountInv).toAmount(),
    }),
    openingHeight: result.state.opening_height,
    openingTime: result.state.opening_time.toISOString(),
  };

  if (result.state.opening_tx) {
    response.openingTx = uint8ArrayToHex(Uint8Array.from(result.state.opening_tx));
  }

  if (result.state.closing_height) {
    response.closingHeight = result.state.closing_height;
  }

  if (result.state.closing_tx) {
    response.closingTx = uint8ArrayToHex(Uint8Array.from(result.state.closing_tx));
  }

  if (result.state.closing_time) {
    response.closingTime = result.state.closing_time.toISOString();
  }

  return response;
};
