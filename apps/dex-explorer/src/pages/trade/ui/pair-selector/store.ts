import { makeAutoObservable } from 'mobx';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { setRecentAssets, getRecentAssets } from './storage';

const MAX_RECENT_PAIRS = 5;

class RecentPairsStore {
  recent: Metadata[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // Add a pair to the stack of recent pairs, the old pairs get auto removed
  add = (asset: Metadata) => {
    if (!this.recent.some(a => a.symbol === asset.symbol)) {
      this.recent = [asset, ...this.recent.slice(0, MAX_RECENT_PAIRS - 1)];
      setRecentAssets(this.recent);
    }
  };

  setup() {
    this.recent = getRecentAssets();
  }
}

export const recentPairsStore = new RecentPairsStore();
