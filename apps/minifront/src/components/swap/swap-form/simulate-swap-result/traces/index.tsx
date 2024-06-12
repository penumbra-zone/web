import { SwapExecution_Trace } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { Trace } from './trace';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { ArrowDown, ArrowUp } from 'lucide-react';

export const Traces = ({
  traces,
  metadataByAssetId,
  input,
  output,
}: {
  traces?: SwapExecution_Trace[];
  metadataByAssetId: Record<string, Metadata>;
  input: ValueView;
  output: ValueView;
}) => {
  if (!traces?.length) return null;

  return (
    <div>
      <p className='font-bold'>Routes</p>
      <p>
        Swaps are filled in descending order of price to get you the best possible trade for your
        tokens.
      </p>

      <div className='mt-4 overflow-auto [scrollbar-width:thin]'>
        <div className='flex justify-between'>
          <div className='flex flex-col items-start gap-2'>
            <ValueViewComponent view={input} size='sm' />
            <ArrowDown size={16} />
          </div>
          <div className='flex flex-col items-end gap-2'>
            <ValueViewComponent view={output} size='sm' />
            <ArrowUp size={16} />
          </div>
        </div>
        <div className='mx-2'>
          <div className='inline-flex w-max min-w-full flex-col border-b border-dashed border-light-brown'>
            {traces.map((trace, index) => (
              <div
                key={index}
                className='flex items-center border-x border-dashed border-light-brown py-2'
              >
                <Trace trace={trace} metadataByAssetId={metadataByAssetId} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
