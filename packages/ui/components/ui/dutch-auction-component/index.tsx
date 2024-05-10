import { DutchAuction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { ActionDetails } from '../tx/view/action-details';
import { ValueViewComponent } from '../tx/view/value';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { Button } from '../button';
import { ArrowRight } from 'lucide-react';
import { Duration } from './duration';

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

interface BaseProps {
  dutchAuction: DutchAuction;
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
  fullSyncHeight?: bigint;
}

interface PropsWithEndButton extends BaseProps {
  showEndButton: true;
  onClickEndButton: VoidFunction;
}

interface PropsWithoutEndButton extends BaseProps {
  showEndButton?: false;
  onClickEndButton?: undefined;
}

type Props = PropsWithEndButton | PropsWithoutEndButton;

export const DutchAuctionComponent = ({
  dutchAuction,
  inputMetadata,
  outputMetadata,
  showEndButton,
  onClickEndButton,
  fullSyncHeight,
}: Props) => {
  const { description } = dutchAuction;
  if (!description) return null;

  const input = getValueView(description.input?.amount, inputMetadata);
  const maxOutput = getValueView(description.maxOutput, outputMetadata);
  const minOutput = getValueView(description.minOutput, outputMetadata);

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex items-center justify-between'>
        <div>
          <ValueViewComponent view={input} />
        </div>

        <ArrowRight />

        <div className='flex w-min flex-wrap justify-end gap-2'>
          <div className='flex items-center gap-2'>
            <span className='text-nowrap text-muted-foreground'>Max:</span>
            <ValueViewComponent view={maxOutput} />
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-nowrap text-muted-foreground'>Min:</span>
            <ValueViewComponent view={minOutput} />
          </div>
        </div>
      </div>

      {!!fullSyncHeight && (
        <Duration
          startHeight={description.startHeight}
          endHeight={description.endHeight}
          fullSyncHeight={fullSyncHeight}
        />
      )}

      <ActionDetails>
        <ActionDetails.Row label='Duration'>
          <span className='mx-1 text-nowrap text-muted-foreground'>Height </span>
          {description.startHeight.toString()}
          <span className='mx-1 text-nowrap text-muted-foreground'> to </span>
          {description.endHeight.toString()}
        </ActionDetails.Row>
      </ActionDetails>

      {showEndButton && (
        <div className='self-end'>
          <Button variant='destructiveSecondary' size='md' onClick={onClickEndButton}>
            End auction
          </Button>
        </div>
      )}
    </div>
  );
};
