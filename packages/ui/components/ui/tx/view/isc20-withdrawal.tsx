import { Ics20Withdrawal } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/ibc/v1/ibc_pb';
import { ViewBox } from './viewbox';
import { ActionDetails } from './action-details';
import { joinLoHiAmount } from '@penumbra-zone/types/src/amount';
import { bech32Address } from '@penumbra-zone/bech32/src/address';

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
              {bech32Address(value.returnAddress)}
            </ActionDetails.Row>
          )}

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
            {new Date(Number(BigInt(value.timeoutTime) / 1_000_000n)).toString()}
          </ActionDetails.Row>
        </ActionDetails>
      }
    />
  );
};
