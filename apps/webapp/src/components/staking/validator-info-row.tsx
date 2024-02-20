import {
  BondingState_BondingStateEnum,
  ValidatorInfo,
  ValidatorState_ValidatorStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import {
  getValidator,
  getStateEnumFromValidatorInfo,
  getBondingStateEnumFromValidatorInfo,
  getFundingStreamsFromValidatorInfo,
  getRateBpsFromFundingStream,
} from '@penumbra-zone/types';
import { TableRow, TableCell } from '@penumbra-zone/ui';
import { Oval } from 'react-loader-spinner';

const getStateLabel = (validatorInfo: ValidatorInfo): string =>
  ValidatorState_ValidatorStateEnum[getStateEnumFromValidatorInfo(validatorInfo)];

const getBondingStateLabel = (validatorInfo: ValidatorInfo): string =>
  BondingState_BondingStateEnum[getBondingStateEnumFromValidatorInfo(validatorInfo)];

const toSum = (prev: number, curr: number) => prev + curr;

export const ValidatorInfoRow = ({
  loading,
  validatorInfo,
  votingPowerByValidatorInfo,
}: {
  loading: boolean;
  validatorInfo: ValidatorInfo;
  votingPowerByValidatorInfo: Map<ValidatorInfo, number>;
}) => {
  const fundingStreams = getFundingStreamsFromValidatorInfo(validatorInfo);
  const totalRateBps = fundingStreams.map(getRateBpsFromFundingStream).reduce(toSum);

  return (
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

      <TableCell>{totalRateBps}bps</TableCell>
    </TableRow>
  );
};
