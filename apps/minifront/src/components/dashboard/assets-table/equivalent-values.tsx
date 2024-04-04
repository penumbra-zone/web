import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { asValueView } from '@penumbra-zone/getters/src/equivalent-value';
import {
  getDisplayDenomFromView,
  getEquivalentValues,
} from '@penumbra-zone/getters/src/value-view';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';

export const EquivalentValues = ({ valueView }: { valueView?: ValueView }) => {
  const equivalentValuesAsValueViews = (getEquivalentValues.optional()(valueView) ?? []).map(
    asValueView,
  );

  return equivalentValuesAsValueViews.map(equivalentValueAsValueView => (
    <ValueViewComponent
      key={getDisplayDenomFromView(equivalentValueAsValueView)}
      view={equivalentValueAsValueView}
      variant='equivalent'
    />
  ));
};
