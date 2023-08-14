// If what you are testing has a long chain of promises, sometimes it's necessary
// to "flush" these promises so you can test their results. See `accounts.test.ts` for an example.
export const flushPromises = () => {
  return new Promise((resolve) => setImmediate(resolve));
};
