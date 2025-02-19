import { ReactNode } from 'react';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDisplay } from '@penumbra-zone/getters/metadata';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { Identicon } from '../Identicon';
import { DelegationTokenIcon } from './DelegationTokenIcon';
import { UnbondingTokenIcon } from './UnbondingTokenIcon';
import cn from 'clsx';

export { AssetGroup, type AssetGroupProps } from './group';

export type Size = 'lg' | 'md' | 'sm';

const sizeMap: Record<Size, string> = {
  lg: cn('w-8 h-8'),
  md: cn('w-6 h-6'),
  sm: cn('w-6 h-6'),
};

export interface AssetIconProps {
  size?: Size;
  metadata?: Metadata;
  /** Technical property, needed for `AssetGroup` component only */
  zIndex?: number;
}

export const AssetIcon = ({ metadata, size = 'md', zIndex }: AssetIconProps) => {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- possibly empty string
  const icon = metadata?.images[0]?.png || metadata?.images[0]?.svg;
  const display = getDisplay.optional(metadata);
  const isDelegationToken = display ? assetPatterns.delegationToken.matches(display) : false;
  const isUnbondingToken = display ? assetPatterns.unbondingToken.matches(display) : false;

  let assetIcon: ReactNode;
  if (icon) {
    assetIcon = <img src={icon} className='block' alt='Asset icon' />;
  } else if (isDelegationToken) {
    assetIcon = <DelegationTokenIcon displayDenom={display} />;
  } else if (isUnbondingToken) {
    /**
     * @todo: Render a custom unbonding token for validators that have a
     * logo -- e.g., with the validator ID superimposed over the validator logo.
     */
    assetIcon = <UnbondingTokenIcon displayDenom={display} />;
  } else {
    assetIcon = <Identicon uniqueIdentifier={metadata?.symbol ?? '?'} type='solid' />;
  }

  return (
    <div style={{ zIndex }} className={cn(sizeMap[size], 'rounded-full overflow-hidden', '[&>*]:w-full [&>*]:h-full')} title={metadata?.symbol}>
      {assetIcon}
    </div>
  );
};
