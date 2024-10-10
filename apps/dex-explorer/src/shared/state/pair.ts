import { makeAutoObservable } from 'mobx';
import { AssetSelectorValue } from '@penumbra-zone/ui/AssetSelector';

class PairState {
  from?: AssetSelectorValue;
  to?: AssetSelectorValue;

  constructor () {
    makeAutoObservable(this);
  }

  setFrom = (value?: AssetSelectorValue) => {
    this.from = value;
  }

  setTo = (value?: AssetSelectorValue) => {
    this.to = value;
  }
}

export const pairStore = new PairState();
