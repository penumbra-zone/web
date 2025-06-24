import cn from 'clsx';
import { ReactNode } from 'react';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDisplay } from '@penumbra-zone/getters/metadata';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { Identicon } from '../Identicon';
import { DelegationTokenIcon } from './delegation-token';
import { UnbondingTokenIcon } from './unbonding-token';
import { CharacterIcon } from './character-icon';

export type Size = 'lg' | 'md' | 'sm';

export const sizeMap: Record<Size, string> = {
  lg: cn('size-8'),
  md: cn('size-6'),
  sm: cn('size-4'),
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
  const isPositionToken = display ? assetPatterns.lpNft.matches(display) : false;
  const isAuctionToken = display ? assetPatterns.auctionNft.matches(display) : false;

  let assetIcon: ReactNode;
  if (icon) {
    assetIcon = <img src={icon} className='block rounded-full' alt='Asset icon' />;
  } else if (isDelegationToken) {
    assetIcon = <DelegationTokenIcon displayDenom={display} />;
  } else if (isUnbondingToken) {
    /**
     * @todo: Render a custom unbonding token for validators that have a
     * logo -- e.g., with the validator ID superimposed over the validator logo.
     */
    assetIcon = <UnbondingTokenIcon displayDenom={display} />;
  } else if (isPositionToken) {
    assetIcon = <CharacterIcon character='P' />;
  } else if (isAuctionToken) {
    assetIcon = <CharacterIcon character='A' />;
  } else {
    assetIcon = <Identicon uniqueIdentifier={metadata?.symbol ?? '?'} type='solid' />;
  }

  return (
    <div
      style={{ zIndex }}
      className={cn(
        sizeMap[size],
        'relative rounded-full',
        '[&>*:first-child]:h-full [&>*:first-child]:w-full',
      )}
      title={metadata?.symbol}
    >
      {assetIcon}
    </div>
  );
};
