import {
  Metadata,
  Value,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { SwapExecution_Trace } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { Fragment } from 'react';
import { Price } from './price';
import { Separator } from '@penumbra-zone/ui/components/ui/separator';
import { cn } from '@penumbra-zone/ui/lib/utils';

const getValueView = (metadataByAssetId: Record<string, Metadata>, { amount, assetId }: Value) =>
  new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount,
        metadata: assetId ? metadataByAssetId[bech32mAssetId(assetId)] : undefined,
      },
    },
  });

export const Trace = ({
  trace,
  metadataByAssetId,
}: {
  trace: SwapExecution_Trace;
  metadataByAssetId: Record<string, Metadata>;
}) => {
  return (
    <div className='flex w-full items-center justify-between gap-2'>
      {trace.value.map((value, index) => (
        <Fragment key={index}>
          {index === 0 && (
            <div className='-ml-2 -mt-5 shrink-0'>
              <Separator />
            </div>
          )}

          <div className='flex shrink-0 flex-col gap-1'>
            <ValueViewComponent view={getValueView(metadataByAssetId, value)} size='sm' />
            {index === 0 && <Price trace={trace} metadataByAssetId={metadataByAssetId} />}
            {index > 0 && <span className='text-xs text-muted-foreground'>&nbsp;</span>}
          </div>

          <div className={cn('-mr-2 -mt-5', index < trace.value.length - 1 && 'grow')}>
            <Separator />
          </div>
        </Fragment>
      ))}
    </div>
  );
};
