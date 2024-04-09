import { BatchSwapOutputData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { IndexedDbInterface } from '@penumbra-zone/types/src/indexed-db';
import { divideAmounts, isZero, subtractAmounts } from '@penumbra-zone/types/src/amount';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import {
  getDelta1Amount,
  getDelta2Amount,
  getLambda1Amount,
  getLambda2Amount,
  getSwapAsset1,
  getSwapAsset2,
  getUnfilled1Amount,
  getUnfilled2Amount,
} from '@penumbra-zone/getters/src/batch-swap-output-data';
import { getAssetId } from '@penumbra-zone/getters/dist/metadata';

/**
 *
 * @param delta -  total amount of 'pricedAsset' that was input to the batch swap
 * @param unfilled - total amount of 'pricedAsset' that was returned unfilled
 * @param lambda - total amount of 'numeraire' that was output from the batch swap
 *  Price formula:
 *  price = (lambda)/(delta - unfilled)
 *  The price cannot be calculated if
 *  - lambda is zero
 *  - delta is zero
 *  - (delta - unfilled) is zero
 * @return 0 if the price cannot be calculated and some positive number if the price has been calculated.
 */
export const calculatePrice = (delta: Amount, unfilled: Amount, lambda: Amount): number => {
  const filledAmount = subtractAmounts(delta, unfilled);

  return isZero(delta) || isZero(lambda) || isZero(filledAmount)
    ? 0
    : divideAmounts(lambda, filledAmount).toNumber();
};

export const updatePricesFromSwaps = async (
  indexedDb: IndexedDbInterface,
  numeraires: Metadata[],
  swapOutputs: BatchSwapOutputData[],
  height: bigint,
) => {
  for (const numeraireMetadata of numeraires) {
    const numeraireAssetId = getAssetId(numeraireMetadata);
    await deriveAndSavePriceFromBSOD(indexedDb, numeraireAssetId, swapOutputs, height);
  }
};

/**
 * Each 'BatchSwapOutputData' (BSOD) can generate up to two prices
 * Each BSOD in block has a unique trading pair
 * Trading pair has a canonical ordering, there's only one trading pair per pair of assets
 * Each BSOD can generate up to two prices
 * 1. pricedAsset -> numeraire (selling price)
 * 2. numeraire -> pricedAsset (buying price)
 * This function processes only (1) price and ignores (2) price
 * We can get a BSOD with zero deltas(inputs), and we shouldn't save the price in that case
 */
export const deriveAndSavePriceFromBSOD = async (
  indexedDb: IndexedDbInterface,
  numeraireAssetId: AssetId,
  swapOutputs: BatchSwapOutputData[],
  height: bigint,
) => {
  for (const swapOutput of swapOutputs) {
    const swapAsset1 = getSwapAsset1(swapOutput);
    const swapAsset2 = getSwapAsset2(swapOutput);

    let numerairePerUnit = 0;
    let pricedAsset: AssetId | undefined = undefined;

    // case for trading pair <pricedAsset,numéraire>
    if (swapAsset2.equals(numeraireAssetId)) {
      pricedAsset = swapAsset1;
      // numerairePerUnit = lambda2/(delta1-unfilled1)
      numerairePerUnit = calculatePrice(
        getDelta1Amount(swapOutput),
        getUnfilled1Amount(swapOutput),
        getLambda2Amount(swapOutput),
      );
    }
    // case for trading pair <numéraire,pricedAsset>
    else if (swapAsset1.equals(numeraireAssetId)) {
      pricedAsset = swapAsset2;
      // numerairePerUnit = lambda1/(delta2-unfilled2)
      numerairePerUnit = calculatePrice(
        getDelta2Amount(swapOutput),
        getUnfilled2Amount(swapOutput),
        getLambda1Amount(swapOutput),
      );
    }

    if (pricedAsset === undefined || numerairePerUnit === 0) continue;

    await indexedDb.updatePrice(pricedAsset, numeraireAssetId, numerairePerUnit, height);
  }
};
