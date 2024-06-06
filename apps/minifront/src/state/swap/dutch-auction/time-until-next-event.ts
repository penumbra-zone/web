/**
 * Calculates the time until the next event using a Poisson distribution, seeded
 * with a lambda specific to the particular auction's parameters.
 */
export const timeUntilNextEvent = (lambda: number): number =>
  Math.abs(Math.log(Math.random()) / lambda);
