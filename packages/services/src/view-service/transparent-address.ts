import type { Impl } from './index.js';

export const transparentAddress: Impl['transparentAddress'] = async (_, _ctx) => {
  throw new Error('transparent addresses not supported.');
};
