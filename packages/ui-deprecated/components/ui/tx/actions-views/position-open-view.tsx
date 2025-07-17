import { ViewBox } from '../viewbox';
import { ActionDetails } from './action-details';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import {
  PositionOpenView,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../tooltip';
import { InfoIcon } from 'lucide-react';

export const PositionOpenViewComponent = ({ value }: { value: PositionOpenView }) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- positionOpenView is present for action rendering.
  const position = value.positionOpenView.value!.action!.position!;

  return (
    <ViewBox
      label='Position Open'
      visibleContent={
        <ActionDetails>
          <ActionDetails.Row label='State'>
            {stateToString(position.state?.state)}
          </ActionDetails.Row>

          <ActionDetails.Row label='Sequence'>
            {position.state?.sequence ? position.state.sequence.toString() : '0'}
          </ActionDetails.Row>

          {!!position.phi?.pair?.asset1 && (
            <ActionDetails.Row label='Asset 1'>
              <ActionDetails.TruncatedText>
                {bech32mAssetId(position.phi.pair.asset1)}
              </ActionDetails.TruncatedText>
            </ActionDetails.Row>
          )}

          {!!position.phi?.pair?.asset2 && (
            <ActionDetails.Row label='Asset 2'>
              <ActionDetails.TruncatedText>
                {bech32mAssetId(position.phi.pair.asset2)}
              </ActionDetails.TruncatedText>
            </ActionDetails.Row>
          )}

          {!!position.phi?.component?.fee && (
            <ActionDetails.Row label='fee'>{position.phi.component.fee}</ActionDetails.Row>
          )}

          <ActionDetails.Row label='Nonce'>
            <ActionDetails.TruncatedText>
              {uint8ArrayToBase64(position.nonce)}
            </ActionDetails.TruncatedText>
          </ActionDetails.Row>

          <ActionDetails.Row label='Close on fill'>
            {position.closeOnFill ? 'true' : 'false'}
          </ActionDetails.Row>

          <div className='flex gap-2'>
            <p className='font-bold'>Trading Parameters</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className='size-4 cursor-pointer text-muted-foreground hover:text-[#8D5728]' />
                </TooltipTrigger>
                <TooltipContent className='w-[250px]'>
                  <p>
                    p and q are the price coefficients of the trading function: phi(r1, r2) = p * r1
                    + q * r2, where r1 and r2 represent the old and new reserves.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {position.phi?.component?.p && (
            <ActionDetails.Row label='p'>
              {joinLoHiAmount(position.phi.component.p).toString()}
            </ActionDetails.Row>
          )}

          {position.phi?.component?.q && (
            <ActionDetails.Row label='q'>
              {joinLoHiAmount(position.phi.component.q).toString()}
            </ActionDetails.Row>
          )}

          {position.reserves?.r1 && (
            <ActionDetails.Row label='r1'>
              {joinLoHiAmount(position.reserves.r1).toString()}
            </ActionDetails.Row>
          )}

          {position.reserves?.r2 && (
            <ActionDetails.Row label='r2'>
              {joinLoHiAmount(position.reserves.r2).toString()}
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
