import { ActionDutchAuctionSchedule } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { ViewBox } from './viewbox';
import { ActionDetails } from './action-details';
import {
  AssetId,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from './value';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';

const getValueView = (amount?: Amount, assetId?: AssetId) =>
  new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount,
        metadata: {
          penumbraAssetId: assetId,
        },
      },
    },
  });

export const ActionDutchAuctionScheduleComponent = ({
  value,
}: {
  value: ActionDutchAuctionSchedule;
}) => {
  const input = getValueView(value.description?.input?.amount, value.description?.input?.assetId);
  const maxOutput = getValueView(value.description?.maxOutput, value.description?.outputId);
  const minOutput = getValueView(value.description?.minOutput, value.description?.outputId);

  return (
    <ViewBox
      label='Schedule a Dutch Auction'
      visibleContent={
        <ActionDetails>
          <ActionDetails.Row label='Input'>
            <ValueViewComponent view={input} />
          </ActionDetails.Row>

          <ActionDetails.Row label='Output'>
            <div className='flex flex-col items-center gap-2 sm:flex-row'>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground'>Max:</span>
                <ValueViewComponent view={maxOutput} />
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground'>Min:</span>
                <ValueViewComponent view={minOutput} />
              </div>
            </div>
          </ActionDetails.Row>

          <ActionDetails.Row label='Duration'>
            Height {value.description?.startHeight.toString()} to{' '}
            {value.description?.endHeight.toString()}
          </ActionDetails.Row>
        </ActionDetails>
      }
    />
  );
};
