import { ViewBox } from './viewbox';
import { SwapClaimView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { JsonViewer } from '../../json-viewer';
import { JsonObject } from '@bufbuild/protobuf';
import { getOutput1, getOutput2 } from '@penumbra-zone/types';
import { ReactNode } from 'react';
import { ValueViewComponent } from './value';

export const SwapClaimViewComponent = ({ value }: { value: SwapClaimView }) => {
  if (value.swapClaimView.case === 'visible') {
    const output1 = getOutput1.optional()(value);
    const output2 = getOutput2.optional()(value);
    let swap: ReactNode | undefined;
    if (output1 && output2)
      swap = (
        <>
          <ViewBox
            label='Swap Claim'
            visibleContent={<ValueViewComponent view={output1.value} />}
          />
          <ViewBox
            label='Swap Claim'
            visibleContent={<ValueViewComponent view={output2.value} />}
          />
        </>
      );

    return (
      <>
        {swap}
        {/* <ViewBox label='Swap Claim' visibleContent={} /> */}

        <ViewBox
          label='Swap Claim - JSON view'
          visibleContent={
            /** @todo: Make a real UI for swap claims -- web#424 */
            <JsonViewer jsonObj={value.swapClaimView.value.toJson() as JsonObject} />
          }
        />
      </>
    );
  }

  if (value.swapClaimView.case === 'opaque') {
    return <ViewBox label='Swap Claim' />;
  }

  return <div>Invalid SpendView</div>;
};
