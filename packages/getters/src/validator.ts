import { Validator } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getFundingStreams = createGetter((validator?: Validator) => validator?.fundingStreams);

export const getIdentityKey = createGetter((validator?: Validator) => validator?.identityKey);
