import { ViewBox } from './viewbox';
import { SwapClaimView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { JsonViewer } from '../json-viewer';
import { JsonObject } from '@bufbuild/protobuf';

export const SwapClaimViewComponent = ({ value }: { value: SwapClaimView }) => {
  if (value.swapClaimView.case === 'visible') {
    return (
      <ViewBox
        label='Swap Claim'
        visibleContent={
          /** @todo: Make a real UI for swap claims -- web#424 */
          <JsonViewer jsonObj={value.swapClaimView.value.toJson() as JsonObject} />
        }
      />
    );
  }

  if (value.swapClaimView.case === 'opaque') {
    return <ViewBox label='Swap Claim' />;
  }

  return <div>Invalid SpendView</div>;
};
