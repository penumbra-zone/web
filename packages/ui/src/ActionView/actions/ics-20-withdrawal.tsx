import { Ics20Withdrawal } from '@penumbra-zone/protobuf/penumbra/core/component/ibc/v1/ibc_pb';
import { UnknownAction } from './unknown';

export interface Ics20WithdrawalActionProps {
  value: Ics20Withdrawal;
}

export const Ics20WithdrawalAction = (_: Ics20WithdrawalActionProps) => {
  return <UnknownAction label='ICS 20 Withdrawal' opaque={false} />;
};
