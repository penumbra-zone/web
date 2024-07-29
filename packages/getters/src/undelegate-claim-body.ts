import { UndelegateClaimBody } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getValidatorIdentity = createGetter(
  (undelegateClaimBody?: UndelegateClaimBody) => undelegateClaimBody?.validatorIdentity,
);
