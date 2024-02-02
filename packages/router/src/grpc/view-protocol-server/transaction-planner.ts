import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { getAddressByIndex, TxPlanner } from '@penumbra-zone/wasm-ts';

import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';

import { Code, ConnectError } from '@connectrpc/connect';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { IndexedDbInterface, RootQuerierInterface } from '@penumbra-zone/types';
import { gasPrices } from './gas-prices';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';

async function getDenomMetadata(
  indexedDb: IndexedDbInterface,
  targetAsset: AssetId,
  querier: RootQuerierInterface,
) {
  // First, try to get the metadata from the internal database.
  const localMetadata = await indexedDb.getAssetsMetadata(targetAsset);
  if (localMetadata) return localMetadata;

  // If not available locally, query the metadata from the node.
  const nodeMetadata = await querier.shieldedPool.denomMetadata(targetAsset);
  if (nodeMetadata) return nodeMetadata;

  // If the metadata is not found, throw an error with details about the asset.
  throw new Error(`No denom metadata found for asset: ${JSON.stringify(targetAsset.toJson())}`);
}

export const transactionPlanner: Impl['transactionPlanner'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const {
    indexedDb,
    viewServer: { fullViewingKey },
    querier,
  } = await services.getWalletServices();
  const fmdParams = await indexedDb.getFmdParams();
  if (!fmdParams) throw new ConnectError('FmdParameters not available', Code.FailedPrecondition);
  const { chainId, sctParams } = (await indexedDb.getAppParams()) ?? {};
  if (!sctParams) throw new ConnectError('SctParameters not available', Code.FailedPrecondition);
  if (!chainId) throw new ConnectError('ChainId not available', Code.FailedPrecondition);

  const idbConstants = indexedDb.constants();

  const planner = await TxPlanner.initialize(idbConstants, chainId, sctParams, fmdParams);

  const fetchedGasPrices = await gasPrices(req, ctx);
  if (fetchedGasPrices.gasPrices) {
    planner.setGasPrices(new GasPrices(fetchedGasPrices.gasPrices));
  }

  if (req.expiryHeight) planner.expiryHeight(req.expiryHeight);
  if (req.memo) planner.memo(req.memo);

  for (const { value, address } of req.outputs) {
    if (!value || !address) throw new Error('no value or address in output');
    planner.output(value, address);
  }

  for (const { value, targetAsset, fee, claimAddress } of req.swaps) {
    if (!value || !targetAsset || !fee || !claimAddress)
      throw new Error('no value, targetAsset, fee or claimAddress in swap');

    const intoDenomMetadata = await getDenomMetadata(indexedDb, targetAsset, querier);
    planner.swap(value, intoDenomMetadata, fee, claimAddress);
  }

  for (const { swapCommitment } of req.swapClaims) {
    if (!swapCommitment) throw new Error('no swapCommitment in swapClaim');
    await planner.swapClaim(swapCommitment);
  }

  for (const withdrawal of req.ics20Withdrawals) {
    planner.ics20Withdrawal(withdrawal);
  }

  const source = req.source ?? new AddressIndex({ account: 0 });

  // If there are any balances left over, refund back to source. Default to account 0.
  const refundAddr = getAddressByIndex(fullViewingKey, source.account);

  const plan = await planner.plan(refundAddr, source);
  return { plan };
};
