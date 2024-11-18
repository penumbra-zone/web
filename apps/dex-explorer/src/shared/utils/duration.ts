export const durationWindows = ['1m', '15m', '1h', '4h', '1d', '1w', '1mo'] as const;
export type DurationWindow = (typeof durationWindows)[number];
export const isDurationWindow = (str: string): str is DurationWindow =>
  durationWindows.includes(str as DurationWindow);
