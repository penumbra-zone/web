import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Progress } from '../progress';
import { getProgress } from './get-progress';
import { getPrice } from './get-price';
import { DutchAuctionDescription } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { ValueViewComponent } from '../tx/view/value';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

const getValueView = (amount: Amount, metadata: Metadata) =>
  new ValueView({ valueView: { case: 'knownAssetId', value: { amount, metadata } } });

export const Duration = ({
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
  const price = getPrice(auctionDescription, inputMetadata, fullSyncHeight);
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
  const [priceWrapperLeft, setPriceWrapperLeft] = useState('');

  useLayoutEffect(() => {
    if (!priceWrapper.current) return;
    setPriceWrapperLeft(
      `clamp(${priceWrapper.current.offsetWidth / 2}px, 100% - ${priceWrapper.current.offsetWidth / 2}px, ${progress * 100}%)`,
    );
  }, [progress]);

  return (
    <div className='flex flex-col gap-2'>
      {!!priceValueView && (
        <div className='relative'>
          <div
            className='absolute w-min -translate-x-1/2'
            ref={priceWrapper}
            style={{ left: priceWrapperLeft }}
          >
            <ValueViewComponent view={priceValueView} size='sm' />
          </div>

          {/* placeholder for absolute-positioned value view */}
          <div className='opacity-0'>
            <ValueViewComponent view={priceValueView} size='sm' />
          </div>
        </div>
      )}

      <Progress value={progress * 100} status='in-progress' size='sm' background='stone' />
      <div className='flex justify-between'>
        <span className='text-xs text-muted-foreground'>
          {auctionDescription.startHeight.toString()}
        </span>
        <span className='text-xs text-muted-foreground'>Block height</span>
        <span className='text-xs text-muted-foreground'>
          {auctionDescription.endHeight.toString()}
        </span>
      </div>
    </div>
  );
};
