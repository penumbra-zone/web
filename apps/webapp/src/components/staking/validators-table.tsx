import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@penumbra-zone/ui';
import { getValidator } from '@penumbra-zone/types';
import { Oval } from 'react-loader-spinner';
import { ValidatorInfoRow } from './validator-info-row';
import { ValidatorInfoContext } from './validator-info-context';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { ReactNode } from 'react';

const HEADERS = ['Validator', 'Voting power', 'Commission', 'Staking'];

interface ValidatorsTableProps extends ValidatorInfoContext {
  /**
   * Content to display inside the Staking cell.
   */
  renderStakingActions: (validatorInfo: ValidatorInfo) => ReactNode;
}

export const ValidatorsTable = ({
  loading,
  error,
  validatorInfos,
  votingPowerByValidatorInfo,
  renderStakingActions,
}: ValidatorsTableProps) => {
  const showError = !!error;
  const showLoading = loading && !validatorInfos.length;
  const showValidators = !showError && !showLoading;

  return (
    <Table className='w-full'>
      <TableHeader>
        <TableRow>
          {HEADERS.map(header => (
            <TableHead key={header}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {showError && (
          <TableRow>
            <TableCell colSpan={HEADERS.length}>
              There was an error loading validators. Please reload the page.
            </TableCell>
          </TableRow>
        )}

        {showLoading && (
          <TableRow>
            <TableCell colSpan={HEADERS.length} className='flex gap-4'>
              <Oval width={16} height={16} color='white' secondaryColor='white' />
            </TableCell>
          </TableRow>
        )}

        {showValidators &&
          validatorInfos.map(validatorInfo => (
            <ValidatorInfoRow
              key={getValidator(validatorInfo).name}
              loading={loading}
              validatorInfo={validatorInfo}
              votingPowerByValidatorInfo={votingPowerByValidatorInfo}
              staking={renderStakingActions(validatorInfo)}
            />
          ))}
      </TableBody>
    </Table>
  );
};
