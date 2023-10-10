import { useEffect } from 'react';
import { useBalances } from './balances';
import { LoHi, uint8ArrayToBase64 } from 'penumbra-types';
import { calculateBalance } from '../utils';
import { Asset } from 'penumbra-constants';

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

    const loHi: LoHi = {
      lo: selectedAsset.balance?.amount?.lo ?? 0n,
      hi: selectedAsset.balance?.amount?.hi ?? 0n,
    };

    setAssetBalance(calculateBalance(loHi, asset));
  }, [end, data, asset, setAssetBalance]);
};
