import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Progress } from '../progress';
import { getProgress } from './get-progress';
import { getPrice } from './get-price';
import { DutchAuctionDescription } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { ValueViewComponent } from '../tx/view/value';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../../lib/utils';

const getValueView = (amount: Amount, metadata: Metadata) =>
  new ValueView({ valueView: { case: 'knownAssetId', value: { amount, metadata } } });

export const PriceGraph = ({
  auctionDescription,
  inputMetadata,
  outputMetadata,
  fullSyncHeight,
}: {
  auctionDescription: DutchAuctionDescription;
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
  fullSyncHeight?: bigint;
}) => {
  const maxPrice = getPrice(auctionDescription, inputMetadata, auctionDescription.startHeight);
  const price = getPrice(auctionDescription, inputMetadata, fullSyncHeight);
  const minPrice = getPrice(auctionDescription, inputMetadata, auctionDescription.endHeight);

  const maxPriceValueView =
    maxPrice && outputMetadata ? getValueView(maxPrice, outputMetadata) : undefined;
  const minPriceValueView =
    minPrice && outputMetadata ? getValueView(minPrice, outputMetadata) : undefined;

  const progress = getProgress(
    auctionDescription.startHeight,
    auctionDescription.endHeight,
    fullSyncHeight,
  );

  const priceValueView = useMemo(
    () => (price && outputMetadata ? getValueView(price, outputMetadata) : undefined),
    [price, outputMetadata],
  );
  const priceWrapper = useRef<HTMLDivElement | null>(null);
  const [positionTop, setPositionTop] = useState('');

  const showProgress =
    !!fullSyncHeight &&
    fullSyncHeight >= auctionDescription.startHeight &&
    fullSyncHeight <= auctionDescription.endHeight;

  useLayoutEffect(() => {
    if (!priceWrapper.current) return;
    setPositionTop(
      `clamp(${priceWrapper.current.offsetHeight / 2}px, 100% - ${priceWrapper.current.offsetHeight / 2}px, ${progress * 100}%)`,
    );
  }, [progress]);

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-4'>
        <div className='grow basis-1/4 text-right'>
          <Label muted>{auctionDescription.startHeight.toString()}</Label>
        </div>

        <div className='w-1 grow-0' />

        <div className='flex grow basis-3/4 items-center gap-1'>
          <ValueViewComponent view={maxPriceValueView} size='sm' />
          {inputMetadata?.symbol && <Label muted>per {inputMetadata.symbol}</Label>}
        </div>
      </div>

      <div className='flex h-[200px] gap-4'>
        <div className='relative grow basis-1/4'>
          {showProgress && (
            <div
              className='absolute w-full -translate-y-1/2 text-right'
              style={{ top: positionTop }}
            >
              <Label>{fullSyncHeight.toString()}</Label>
            </div>
          )}
        </div>

        <div className='w-1 grow-0'>
          <div className='w-[200px] origin-top-left translate-x-1 rotate-90'>
            <Progress value={progress * 100} status='in-progress' size='sm' background='stone' />
          </div>
        </div>

        <div className='relative h-full grow basis-3/4'>
          {!!showProgress && !!priceValueView && (
            <div
              className='absolute flex w-full -translate-y-1/2 items-center gap-1'
              ref={priceWrapper}
              style={{ top: positionTop }}
            >
              <ValueViewComponent view={priceValueView} size='sm' />
              {inputMetadata?.symbol && <Label muted>per {inputMetadata.symbol}</Label>}
            </div>
          )}
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <div className='grow basis-1/4 text-right'>
          <Label muted>{auctionDescription.endHeight.toString()}</Label>
        </div>

        <div className='w-1 grow-0' />

        <div className='flex grow basis-3/4 items-center gap-1'>
          <ValueViewComponent view={minPriceValueView} size='sm' />
          {inputMetadata?.symbol && <Label muted>per {inputMetadata.symbol}</Label>}
        </div>
      </div>
    </div>
  );
};

const Label = ({ children, muted }: { children: ReactNode; muted?: boolean }) => (
  <span className={cn('text-nowrap text-xs', muted && 'text-muted-foreground')}>{children}</span>
);
