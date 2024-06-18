import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { TableCell, TableRow } from '@repo/ui/components/ui/table';
import { ReactNode } from 'react';
import { Oval } from 'react-loader-spinner';
import { getValidator } from '@penumbra-zone/getters/validator-info';
import { calculateCommissionAsPercentage } from '@penumbra-zone/types/staking';

export const ValidatorInfoRow = ({
  loading,
  validatorInfo,
  votingPowerByValidatorInfo,
  staking,
}: {
  loading: boolean;
  validatorInfo: ValidatorInfo;
  votingPowerByValidatorInfo: Map<ValidatorInfo, number>;
  staking: ReactNode;
}) => (
  <TableRow>
    <TableCell>{getValidator(validatorInfo).name}</TableCell>
    <TableCell>
      {loading ? (
        <Oval width={16} height={16} color='white' secondaryColor='white' />
      ) : (
        `${votingPowerByValidatorInfo.get(validatorInfo)}%`
      )}
    </TableCell>

    <TableCell>{calculateCommissionAsPercentage(validatorInfo)}%</TableCell>

    <TableCell>{staking}</TableCell>
  </TableRow>
);
