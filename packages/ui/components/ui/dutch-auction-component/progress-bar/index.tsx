import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '../../tx/view/value';
import { DutchAuctionDescription } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { Separator } from '../../separator';
import { getProgress } from '../get-progress';
import { Indicator } from './indicator';

const getEmptyValueView = (metadata: Metadata) =>
  new ValueView({ valueView: { case: 'knownAssetId', value: { metadata } } });

export const ProgressBar = ({
  auction,
  input,
  outputMetadata,
  fullSyncHeight,
  seqNum,
}: {
  auction: DutchAuctionDescription;
  input: ValueView;
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
  fullSyncHeight?: bigint;
  seqNum?: bigint;
}) => {
  const progress = getProgress(auction.startHeight, auction.endHeight, fullSyncHeight);
  const auctionEnded =
    (!!seqNum && seqNum > 0n) || (!!fullSyncHeight && fullSyncHeight >= auction.endHeight);

  return (
    <div className='relative flex w-full items-center justify-between gap-4'>
      <ValueViewComponent view={input} size='sm' />

      <div className='relative flex grow items-center'>
        {seqNum !== undefined && (
          <div className='absolute -translate-x-1/2' style={{ left: `${progress * 100}%` }}>
            <Indicator icon={auctionEnded ? 'checkmark' : 'arrow'} />
          </div>
        )}

        <Separator />
      </div>

      {outputMetadata && (
        <ValueViewComponent view={getEmptyValueView(outputMetadata)} size='sm' showValue={false} />
      )}
    </div>
  );
};
