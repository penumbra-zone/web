import {
  Metadata,
  Value,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { SwapExecution_Trace } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { Fragment } from 'react';

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

const Separator = () => (
  // eslint-disable-next-line tailwindcss/no-unnecessary-arbitrary-value
  <div className='mx-2 h-px min-w-4 grow border-b-[1px] border-dotted border-light-brown' />
);

export const Trace = ({
  trace,
  metadataByAssetId,
}: {
  trace: SwapExecution_Trace;
  metadataByAssetId: Record<string, Metadata>;
}) => {
  return (
    <div className='flex items-center justify-between gap-2'>
      {trace.value.map((value, index) => (
        <Fragment key={index}>
          <div className='shrink-0'>
            <ValueViewComponent view={getValueView(metadataByAssetId, value)} size='sm' />
          </div>

          {index < trace.value.length - 1 && <Separator />}
        </Fragment>
      ))}
    </div>
  );
};
