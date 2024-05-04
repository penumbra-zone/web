import { DutchAuction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { ActionDetails } from './tx/view/action-details';
import { ValueViewComponent } from './tx/view/value';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
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

export const DutchAuctionComponent = ({
  dutchAuction,
  inputMetadata,
  outputMetadata,
}: {
  dutchAuction: DutchAuction;
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
}) => {
  const { description } = dutchAuction;
  if (!description) return null;

  const input = getValueView(description.input?.amount, inputMetadata);
  const maxOutput = getValueView(description.maxOutput, outputMetadata);
  const minOutput = getValueView(description.minOutput, outputMetadata);

  return (
    <ActionDetails>
      <ActionDetails.Row label='Input'>
        <ValueViewComponent view={input} />
      </ActionDetails.Row>

      <ActionDetails.Row label='Output'>
        <div className='flex flex-wrap justify-end gap-2'>
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
        {description.startHeight.toString()}
        <span className='mx-1 text-nowrap text-muted-foreground'> to </span>
        {description.endHeight.toString()}
      </ActionDetails.Row>
    </ActionDetails>
  );
};
