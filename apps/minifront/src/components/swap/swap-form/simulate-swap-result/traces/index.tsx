import { SwapExecution_Trace } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Trace } from './trace';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui-deprecated/components/ui/value';
import { ArrowRight } from 'lucide-react';

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
  if (!traces?.length) {
    return null;
  }

  return (
    <div>
      <p className='font-bold'>Routes</p>
      <p>
        Swaps are filled in descending order of price to get you the best possible trade for your
        tokens.
      </p>

      <div className='mt-4 flex overflow-auto [scrollbar-width:thin]'>
        <div className='mx-2 w-min grow'>
          <div className='relative flex items-center justify-between'>
            <ValueViewComponent view={input} size='sm' />
            <div className='absolute left-1/2 flex -translate-x-1/2 items-center'>
              <ArrowRight size={20} strokeWidth={2.5} className='text-white' />
            </div>
            <ValueViewComponent view={output} size='sm' />
          </div>
          <div className='mt-2 inline-flex w-max min-w-full flex-col pb-10'>
            {traces.map((trace, index) => (
              <div
                key={index}
                className='flex items-center border-x border-b border-dashed border-light-brown px-8 pb-2'
              >
                <div className='w-full translate-y-10'>
                  <Trace trace={trace} metadataByAssetId={metadataByAssetId} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
