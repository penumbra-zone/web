import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export interface Pair {
  base: Metadata;
  quote: Metadata;
}

const STAR_STORE_LS_KEY = 'star-pairs-store';

export const getStarredPairs = (): Pair[] => {
  try {
    const data = JSON.parse(localStorage.getItem(STAR_STORE_LS_KEY) ?? '[]') as {
      base: string;
      quote: string;
    }[];
    return data.map(pair => ({
      base: Metadata.fromJson(pair.base),
      quote: Metadata.fromJson(pair.quote),
    }));
  } catch (_) {
    return [];
  }
};

export const setStarredPairs = (pairs: Pair[]): void => {
  localStorage.setItem(
    STAR_STORE_LS_KEY,
    JSON.stringify(
      pairs.map(pair => ({
        base: pair.base.toJson(),
        quote: pair.quote.toJson(),
      })),
    ),
  );
};
