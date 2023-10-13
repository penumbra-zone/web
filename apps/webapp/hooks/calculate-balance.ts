import { useEffect } from 'react';
import { useBalances } from './balances';
import { Asset, calculateLoHiExponent, uint8ArrayToBase64 } from 'penumbra-types';

export const useCalculateBalance = (asset: Asset, setAssetBalance: (amount: number) => void) => {
  const { data, end } = useBalances();

  useEffect(() => {
    if (!end) return;
    const selectedAsset = data.find(
      i =>
        i.balance?.assetId?.inner &&
        uint8ArrayToBase64(i.balance.assetId.inner) === asset.penumbraAssetId.inner,
    );

    if (!selectedAsset) {
      setAssetBalance(0);
      return;
    }

    const exponent = asset.denomUnits.find(d => d.denom === asset.display)!.exponent;

    setAssetBalance(
      Number(
        calculateLoHiExponent(
          selectedAsset.balance?.amount?.lo,
          selectedAsset.balance?.amount?.hi,
          exponent,
        ),
      ),
    );
  }, [end, data, asset, setAssetBalance]);
};
