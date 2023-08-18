import { StateCreator } from 'zustand';
import { AllSlices } from './index';
import { Middleware } from './persist';

type LoggerImpl = (f: StateCreator<AllSlices>) => StateCreator<AllSlices>;

const loggerImpl: LoggerImpl = (f) => (set, get, store) => {
  const loggedSet: typeof set = (...a) => {
    set(...a);
    console.log(get()); // Can specify more specific slices here
  };
  store.setState = loggedSet;

  return f(loggedSet, get, store);
};

// Meant to log the store/slices on each dispatch for debugging purposes
export const logger = loggerImpl as Middleware;
