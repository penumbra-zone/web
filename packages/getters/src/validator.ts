import { Validator } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { createGetter } from './utils/create-getter.js';

export const getFundingStreams = createGetter((validator?: Validator) => validator?.fundingStreams);

export const getIdentityKey = createGetter((validator?: Validator) => validator?.identityKey);
