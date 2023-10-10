import { useEffect } from 'react';
import { useBalances } from './balances';
import { Asset, calculateLoHiExponent, uint8ArrayToBase64 } from 'penumbra-types';

export const useCalculateBalance = (asset: Asset, setAssetBalance: (amount: number) => void) => {
  const { data, end } = useBalances({ account: 0 });

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

    setAssetBalance(
      Number(
        calculateLoHiExponent(
          selectedAsset.balance?.amount?.lo ?? 0n,
          selectedAsset.balance?.amount?.hi,
          asset,
        ),
      ),
    );
  }, [end, data, asset, setAssetBalance]);
};
