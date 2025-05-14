import { TournamentParams } from './types';

// this serves to keep the url short
// as we will use it in an x post
export const queryParamMap = {
  t: 'epoch',
  e: 'earnings',
  v: 'votingStreak',
  i: 'incentivePool',
  l: 'lpPool',
  d: 'delegatorPool',
};

export function encodeParams(params: TournamentParams): string {
  const keyMap = Object.fromEntries(
    Object.entries(queryParamMap).map(([key, value]) => [value, key]),
  ) as Record<string, string>;

  return Object.entries(params)
    .map(([key, value]) => `${keyMap[key]}=${value}`)
    .join('&');
}
