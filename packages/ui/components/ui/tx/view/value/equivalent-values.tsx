import { EquivalentValue } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../tooltip';
import { ValueViewComponent } from './index';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/src/value-view';
import { asValueView } from '@penumbra-zone/getters/src/equivalent-value';

export const EquivalentValues = ({
  children,
  equivalentValues,
}: {
  children: ReactNode;
  equivalentValues: EquivalentValue[];
}) => {
  const equivalentValuesAsValueViews = equivalentValues.map(asValueView);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent className='flex flex-col gap-2'>
          Equivalent values:
          {equivalentValuesAsValueViews.map(valueView => (
            <ValueViewComponent
              key={getDisplayDenomFromView(valueView)}
              view={valueView}
              showEquivalent={false}
            />
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
