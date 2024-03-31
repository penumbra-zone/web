import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { STAKING_TOKEN_METADATA } from '@penumbra-zone/constants/src/assets';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/src/value-view';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@penumbra-zone/ui/components/ui/tooltip';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { ReactNode } from 'react';

/**
 * A default `ValueView` to render when we don't have any balance data for a
 * particular token in the given account.
 */
const zeroBalanceUm = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 0n },
      metadata: STAKING_TOKEN_METADATA,
    },
  },
});

export const UnbondingTokens = ({
  total,
  tokens,
  children,
}: {
  total?: ValueView;
  tokens?: ValueView[];
  children?: ReactNode;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <ValueViewComponent view={total ?? zeroBalanceUm} />
        </TooltipTrigger>
        <TooltipContent>
          <div className='flex flex-col gap-4'>
            <div className='max-w-[250px]'>
              Total amount of UM you will receive when all your unbonding tokens are claimed,
              assuming no slashing.
            </div>

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
