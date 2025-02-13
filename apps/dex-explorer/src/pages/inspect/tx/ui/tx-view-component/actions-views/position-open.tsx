import { ViewBox } from '../viewbox';
import { ActionDetails } from './action-details';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import {
  PositionOpen,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import { InfoIcon } from 'lucide-react';

export const PositionOpenComponent = ({ value }: { value: PositionOpen }) => {
  return (
    <ViewBox
      label='Position Open'
      visibleContent={
        <ActionDetails>
          <ActionDetails.Row label='State'>
            {stateToString(value.position?.state?.state)}
          </ActionDetails.Row>

          <ActionDetails.Row label='Sequence'>
            {value.position?.state?.sequence ? value.position.state.sequence.toString() : '0'}
          </ActionDetails.Row>

          {!!value.position?.phi?.pair?.asset1 && (
            <ActionDetails.Row label='Asset 1'>
              <ActionDetails.TruncatedText>
                {bech32mAssetId(value.position.phi.pair.asset1)}
              </ActionDetails.TruncatedText>
            </ActionDetails.Row>
          )}

          {!!value.position?.phi?.pair?.asset2 && (
            <ActionDetails.Row label='Asset 2'>
              <ActionDetails.TruncatedText>
                {bech32mAssetId(value.position.phi.pair.asset2)}
              </ActionDetails.TruncatedText>
            </ActionDetails.Row>
          )}

          {!!value.position?.phi?.component?.fee && (
            <ActionDetails.Row label='fee'>{value.position.phi.component.fee}</ActionDetails.Row>
          )}

          {value.position?.nonce && (
            <ActionDetails.Row label='Nonce'>
              <ActionDetails.TruncatedText>
                {uint8ArrayToBase64(value.position.nonce)}
              </ActionDetails.TruncatedText>
            </ActionDetails.Row>
          )}

          <ActionDetails.Row label='Close on fill'>
            {value.position?.closeOnFill ? 'true' : 'false'}
          </ActionDetails.Row>

          <div className='flex gap-2'>
            <p className='font-bold'>Trading Parameters</p>
            <Tooltip message='p and q are the price coefficients of the trading function: phi(r1, r2) = p * r1 + q * r2, where r1 and r2 represent the old and new reserves.'>
              <InfoIcon className='size-4 cursor-pointer text-muted-foreground hover:text-[#8D5728]' />
            </Tooltip>
          </div>

          {value.position?.phi?.component?.p && (
            <ActionDetails.Row label='p'>
              {joinLoHiAmount(value.position.phi.component.p).toString()}
            </ActionDetails.Row>
          )}

          {value.position?.phi?.component?.q && (
            <ActionDetails.Row label='q'>
              {joinLoHiAmount(value.position.phi.component.q).toString()}
            </ActionDetails.Row>
          )}

          {value.position?.reserves?.r1 && (
            <ActionDetails.Row label='r1'>
              {joinLoHiAmount(value.position.reserves.r1).toString()}
            </ActionDetails.Row>
          )}

          {value.position?.reserves?.r2 && (
            <ActionDetails.Row label='r2'>
              {joinLoHiAmount(value.position.reserves.r2).toString()}
            </ActionDetails.Row>
          )}
        </ActionDetails>
      }
    />
  );
};

export const stateToString = (state?: PositionState_PositionStateEnum): string => {
  switch (state) {
    case PositionState_PositionStateEnum.UNSPECIFIED: {
      return 'UNSPECIFIED';
    }
    case PositionState_PositionStateEnum.OPENED: {
      return 'OPENED';
    }
    case PositionState_PositionStateEnum.CLOSED: {
      return 'CLOSED';
    }
    case PositionState_PositionStateEnum.WITHDRAWN: {
      return 'WITHDRAWN';
    }
    case PositionState_PositionStateEnum.CLAIMED: {
      return 'CLAIMED';
    }
    case undefined: {
      return 'UNSPECIFIED';
    }
  }
};
