export interface TournamentQueryParams extends Record<string, string> {
  t: string;
  e: `${number}:${string}`;
  v: `${number}:${string}`;
  i: `${number}:${string}`;
  l: `${number}:${string}`;
  d: `${number}:${string}`;
}

export interface TournamentParams extends Record<string, string | number> {
  epoch: string;
  reward: number;
  earnings: `${number}:${string}`;
  votingStreak: `${number}:${string}`;
  incentivePool: `${number}:${string}`;
  lpPool: `${number}:${string}`;
  delegatorPool: `${number}:${string}`;
}
