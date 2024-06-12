import { SwapExecution_Trace } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { Trace } from './trace';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export const Traces = ({
  traces,
  metadataByAssetId,
}: {
  traces?: SwapExecution_Trace[];
  metadataByAssetId: Record<string, Metadata>;
}) => {
  if (!traces?.length) return null;

  return (
    <div>
      <p className='font-bold'>Routes</p>
      <p>
        Swaps are filled in descending order of price to get you the best possible trade for your
        tokens.
      </p>

      <div className='mt-4 flex flex-col gap-2 overflow-auto [scrollbar-width:thin]'>
        <div className='inline-flex w-max min-w-full flex-col gap-4'>
          {traces.map((trace, index) => (
            <Trace key={index} trace={trace} metadataByAssetId={metadataByAssetId} />
          ))}
        </div>
      </div>
    </div>
  );
};
