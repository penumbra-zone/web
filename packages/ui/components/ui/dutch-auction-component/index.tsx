import { DutchAuction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { ValueViewComponent } from '../tx/view/value';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { Button } from '../button';
import { ArrowRight } from 'lucide-react';
import { PriceGraph } from './price-graph';

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

interface PropsWithButton extends BaseProps {
  buttonType: 'end' | 'withdraw';
  onClickButton: VoidFunction;
}

interface PropsWithoutButton extends BaseProps {
  buttonType?: undefined;
  onClickButton?: undefined;
}

type Props = PropsWithButton | PropsWithoutButton;

export const DutchAuctionComponent = ({
  dutchAuction,
  inputMetadata,
  outputMetadata,
  fullSyncHeight,
  buttonType,
  onClickButton,
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

      <PriceGraph
        auctionDescription={description}
        inputMetadata={inputMetadata}
        outputMetadata={outputMetadata}
        fullSyncHeight={fullSyncHeight}
      />

      {buttonType === 'withdraw' && (
        <div className='self-end'>
          <Button variant='gradient' size='md' onClick={onClickButton}>
            Withdraw funds
          </Button>
        </div>
      )}

      {buttonType === 'end' && (
        <div className='self-end'>
          <Button variant='destructiveSecondary' size='md' onClick={onClickButton}>
            End auction
          </Button>
        </div>
      )}
    </div>
  );
};
