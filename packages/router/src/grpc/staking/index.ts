import { QueryService as StakingService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';
import { ServiceImpl } from '@connectrpc/connect';
import { validatorInfo } from './validator-info';

export type Impl = ServiceImpl<typeof StakingService>;

export const stakingImpl: Pick<Impl, 'validatorInfo'> = { validatorInfo };
