import cn from 'clsx';
import { ReactNode } from 'react';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Identicon } from '../Identicon';

export type Size = 'lg' | 'md' | 'sm';

export const sizeMap: Record<Size, string> = {
  lg: cn('size-8'),
  md: cn('size-6'),
  sm: cn('size-4'),
};

const badgeSizeMap: Record<Size, string> = {
  lg: cn('size-4 -bottom-[3px] -right-[3px]'),
  md: cn('size-3 -bottom-[2px] -right-[2px]'),
  sm: cn('size-2 -bottom-[1px] -right-[1px]'),
};

export interface AssetIconProps {
  size?: Size;
  metadata?: Metadata;
  hideBadge?: boolean;
  zIndex?: number;
  isDelegated?: boolean;
}

export const AssetIcon = ({
  metadata,
  size = 'md',
  hideBadge = false,
  zIndex,
  isDelegated = false,
}: AssetIconProps) => {
  const pngUrl = metadata?.images[0]?.png;
  const svgUrl = metadata?.images[0]?.svg;
  const iconUrl = pngUrl?.trim() ? pngUrl : svgUrl;

  let assetIconElement: ReactNode;

  if (iconUrl) {
    assetIconElement = (
      <img src={iconUrl} className='block rounded-full' alt={metadata?.symbol ?? 'Asset icon'} />
    );
  } else {
    assetIconElement = <Identicon uniqueIdentifier={metadata?.symbol ?? '?'} type='solid' />;
  }

  const DelegationBadge = () => (
    <div
      className={cn(
        badgeSizeMap[size],
        'absolute flex items-center justify-center rounded-full bg-[#8D5728] shadow-sm w-3 h-3 text-white text-[10px] font-bold',
      )}
    >
      D
    </div>
  );

  return (
    <div
      style={{ zIndex }}
      className={cn(
        sizeMap[size],
        'relative rounded-full',
        '[&>*:first-child]:w-full [&>*:first-child]:h-full',
      )}
      title={metadata?.symbol}
    >
      {assetIconElement}
      {!hideBadge && isDelegated && <DelegationBadge />}
    </div>
  );
};
