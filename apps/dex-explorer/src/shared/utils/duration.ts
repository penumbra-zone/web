export const durationWindows = ['1m', '15m', '1h', '4h', '1d', '1w', '1mo'] as const;
export type DurationWindow = (typeof durationWindows)[number];
export const isDurationWindow = (str: string): str is DurationWindow =>
  durationWindows.includes(str as DurationWindow);

export const addDurationWindow = (window: DurationWindow, to: Date): Date => {
  const out = new Date(to);
  switch (window) {
    case '1m':
      out.setMinutes(to.getMinutes() + 1);
      break;
    case '15m':
      out.setMinutes(to.getMinutes() + 15);
      break;
    case '1h':
      out.setHours(to.getHours() + 1);
      break;
    case '4h':
      out.setHours(to.getHours() + 4);
      break;
    case '1d':
      out.setDate(to.getDate() + 1);
      break;
    case '1w':
      out.setDate(to.getDate() + 7);
      break;
    case '1mo':
      out.setMonth(to.getMonth() + 1);
      break;
  }
  return out;
};
