import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import {
  calculateCommissionAsPercentage,
  getBondingStateLabel,
  getStateLabel,
  getValidator,
} from '@penumbra-zone/types';
import { TableRow, TableCell } from '@penumbra-zone/ui';
import { Oval } from 'react-loader-spinner';

export const ValidatorInfoRow = ({
  loading,
  validatorInfo,
  votingPowerByValidatorInfo,
}: {
  loading: boolean;
  validatorInfo: ValidatorInfo;
  votingPowerByValidatorInfo: Map<ValidatorInfo, number>;
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

    {/** @todo: Render an icon for each state */}
    <TableCell>{getStateLabel(validatorInfo)}</TableCell>

    {/** @todo: Render an icon for each state */}
    <TableCell>{getBondingStateLabel(validatorInfo)}</TableCell>

    <TableCell>{calculateCommissionAsPercentage(validatorInfo)}%</TableCell>
  </TableRow>
);
