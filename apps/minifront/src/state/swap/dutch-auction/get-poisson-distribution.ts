/**
 * Copied from https://www.reddit.com/r/learnjavascript/comments/12clvxe/comment/k3hsec8/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
 */
export const getPoissonDistribution = (lambda: number, length: number): number => {
  const sampleNextEventTime = () => {
    return Math.abs(Math.log(Math.random()) / lambda);
  };

  let time = 0;
  let nevents = 0;
  while (time < length) {
    time += sampleNextEventTime();
    nevents += 1;
  }
  return nevents - 1; // last event is after time_period expired
};
