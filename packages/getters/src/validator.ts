import { Validator } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';
import { createGetter } from './utils/create-getter.js';

export const getFundingStreams = createGetter((validator?: Validator) => validator?.fundingStreams);

export const getIdentityKey = createGetter((validator?: Validator) => validator?.identityKey);
