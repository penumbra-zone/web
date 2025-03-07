import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

const RECENT_STORE_LS_KEY = 'recent-pairs-store';

export const getRecentAssets = (): Metadata[] => {
  try {
    const data = JSON.parse(localStorage.getItem(RECENT_STORE_LS_KEY) ?? '[]') as string[];
    return data.map(asset => Metadata.fromJson(asset));
  } catch (_) {
    return [];
  }
};

export const setRecentAssets = (assets: Metadata[]): void => {
  localStorage.setItem(RECENT_STORE_LS_KEY, JSON.stringify(assets.map(asset => asset.toJson())));
};
