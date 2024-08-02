import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { asValueView } from '@penumbra-zone/getters/equivalent-value';
import { getDisplayDenomFromView, getEquivalentValues } from '@penumbra-zone/getters/value-view';
import { ValueViewComponent } from '@repo/ui/components/ui/value';

export const EquivalentValues = ({ valueView }: { valueView?: ValueView }) => {
  const equivalentValuesAsValueViews = (getEquivalentValues.optional()(valueView) ?? []).map(
    asValueView,
  );

  return (
    <div className='flex flex-wrap gap-2'>
      {equivalentValuesAsValueViews.map(equivalentValueAsValueView => (
        <ValueViewComponent
          key={getDisplayDenomFromView(equivalentValueAsValueView)}
          view={equivalentValueAsValueView}
          variant='equivalent'
        />
      ))}
    </div>
  );
};
