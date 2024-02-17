import { stakingClient } from '../clients/grpc';

/**
 * @todo: Make `showInactive` configurable via UI filters.
 */
export const getValidatorInfos = () => stakingClient.validatorInfo({ showInactive: false });
