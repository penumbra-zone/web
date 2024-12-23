import { Ics20Withdrawal } from '@penumbra-zone/protobuf/penumbra/core/component/ibc/v1/ibc_pb';
import { ViewBox } from '../viewbox';
import { ActionDetails } from './action-details';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { bech32TransparentAddress } from '@penumbra-zone/bech32m/tpenumbra';

// Converts nanoseconds timestamp to UTC timestamp string
export const getUtcTime = (time: bigint) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'long',
    timeZone: 'UTC',
  });
  const date = new Date(Number(time / 1_000_000n));
  return formatter.format(date);
};

export const Ics20WithdrawalComponent = ({ value }: { value: Ics20Withdrawal }) => {
  return (
    <ViewBox
      label='Ics20 Withdrawal'
      visibleContent={
        <ActionDetails>
          {value.denom && <ActionDetails.Row label='Denom'>{value.denom.denom}</ActionDetails.Row>}

          {value.amount && (
            <ActionDetails.Row label='Amount'>
              {joinLoHiAmount(value.amount).toString()}
            </ActionDetails.Row>
          )}

          <ActionDetails.Row label='Destination Address'>
            {value.destinationChainAddress}
          </ActionDetails.Row>

          <ActionDetails.Row label='Source channel'>{value.sourceChannel}</ActionDetails.Row>

          {value.returnAddress && (
            <ActionDetails.Row label='Return Address'>
              {value.useTransparentAddress
                ? bech32TransparentAddress({ inner: value.returnAddress.inner.slice(0, 32) })
                : bech32mAddress(value.returnAddress)}
            </ActionDetails.Row>
          )}

          <ActionDetails.Row label='Use Transparent Address'>
            {value.useTransparentAddress ? 'TRUE' : 'FALSE'}
          </ActionDetails.Row>

          {value.timeoutHeight && (
            <>
              <ActionDetails.Row label='Timeout Revision Height'>
                {value.timeoutHeight.revisionHeight.toString()}
              </ActionDetails.Row>
              <ActionDetails.Row label='Timeout Revision Number'>
                {value.timeoutHeight.revisionNumber.toString()}
              </ActionDetails.Row>
            </>
          )}

          <ActionDetails.Row label='Timeout Time'>
            {getUtcTime(value.timeoutTime)}
          </ActionDetails.Row>
        </ActionDetails>
      }
    />
  );
};
