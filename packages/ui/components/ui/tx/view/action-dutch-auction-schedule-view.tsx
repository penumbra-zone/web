import { ActionDutchAuctionScheduleView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { ViewBox } from './viewbox';
import { ActionDetails } from './action-details';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from './value';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';

const getValueView = (amount?: Amount, metadata?: Metadata) =>
  new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount,
        metadata,
      },
    },
  });

export const ActionDutchAuctionScheduleViewComponent = ({
  value,
}: {
  value: ActionDutchAuctionScheduleView;
}) => {
  const input = getValueView(value.action?.description?.input?.amount, value.inputMetadata);
  const maxOutput = getValueView(value.action?.description?.maxOutput, value.outputMetadata);
  const minOutput = getValueView(value.action?.description?.minOutput, value.outputMetadata);

  return (
    <ViewBox
      label='Schedule a Dutch Auction'
      visibleContent={
        <ActionDetails>
          <ActionDetails.Row label='Input'>
            <ValueViewComponent view={input} />
          </ActionDetails.Row>

          <ActionDetails.Row label='Output'>
            <div className='flex flex-col items-end gap-2 sm:flex-row'>
              <div className='flex items-center gap-2'>
                <span className='text-nowrap text-muted-foreground'>Max:</span>
                <ValueViewComponent view={maxOutput} />
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-nowrap text-muted-foreground'>Min:</span>
                <ValueViewComponent view={minOutput} />
              </div>
            </div>
          </ActionDetails.Row>

          <ActionDetails.Row label='Duration'>
            <span className='mx-1 text-nowrap text-muted-foreground'>Height </span>
            {value.action?.description?.startHeight.toString()}
            <span className='mx-1 text-nowrap text-muted-foreground'> to </span>
            {value.action?.description?.endHeight.toString()}
          </ActionDetails.Row>
        </ActionDetails>
      }
    />
  );
};
