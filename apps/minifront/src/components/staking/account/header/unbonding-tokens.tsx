import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/src/value-view';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@penumbra-zone/ui/components/ui/tooltip';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { ReactNode } from 'react';
import { ZERO_BALANCE_UM } from './constants';

export const UnbondingTokens = ({
  total,
  tokens,
  helpText,
  children,
}: {
  total?: ValueView;
  tokens?: ValueView[];
  helpText: string;
  children?: ReactNode;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <ValueViewComponent view={total ?? ZERO_BALANCE_UM} />
        </TooltipTrigger>
        <TooltipContent>
          <div className='flex flex-col gap-4'>
            <div className='max-w-[250px]'>{helpText}</div>

            {!!tokens?.length &&
              tokens.map(token => (
                <ValueViewComponent key={getDisplayDenomFromView(token)} view={token} />
              ))}

            {children}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
