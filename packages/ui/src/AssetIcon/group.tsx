import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ElementType } from 'react';
import cn from 'clsx';
import { Size, AssetIcon, sizeMap } from './single';

export interface AssetGroupProps {
  assets?: (Metadata | undefined)[];
  as?: ElementType;
  size?: Size;
  variant?: 'overlay' | 'split';
  hideBadge?: boolean;
}

const OVERLAY_SIZE_MAP: Record<Size, string> = {
  lg: '[&>*:not(:first-child)]:-ml-4',
  md: '[&>*:not(:first-child)]:-ml-3',
  sm: '[&>*:not(:first-child)]:-ml-2',
};

const SPLIT_SIZE_MAP: Record<Size, string> = {
  lg: 'w-4 max-w-4',
  md: 'w-3 max-w-3',
  sm: 'w-2 max-w-2',
};

const LEFT_BADGE_SIZE_MAP: Record<Size, string> = {
  lg: '[&_*[data-badge="true"]]:-left-[3px] right-unset',
  md: '[&_*[data-badge="true"]]:-left-[2px] right-unset',
  sm: '[&_*[data-badge="true"]]:-left-[1px] right-unset',
};

const MARGIN_SIZE_MAP: Record<Size, string> = {
  lg: '-ml-4',
  md: '-ml-3',
  sm: '-ml-2',
};

const LEFT_CLIP_PATH = cn(
  '[&_img:not([data-badge="true"])]:[clip-path:inset(0px_0px_0px_50%)] [&_svg]:[clip-path:inset(0px_0px_0px_50%)]',
);
const RIGHT_CLIP_PATH = cn(
  '[&_img:not([data-badge="true"])]:[clip-path:inset(0px_50%_0px_0px)] [&_svg]:[clip-path:inset(0px_50%_0px_0px)]',
);

export const AssetGroup = ({
  assets,
  as: Container = 'div',
  size = 'md',
  variant = 'overlay',
  hideBadge,
}: AssetGroupProps) => {
  if (variant === 'split') {
    return (
      <Container className={cn('relative flex items-center gap-[1px]', sizeMap[size])}>
        {assets?.[0] && (
          <div className={cn(SPLIT_SIZE_MAP[size], LEFT_BADGE_SIZE_MAP[size], RIGHT_CLIP_PATH)}>
            <AssetIcon hideBadge={hideBadge} metadata={assets[0]} size={size} />
          </div>
        )}
        {assets?.[1] && (
          <div className={cn(SPLIT_SIZE_MAP[size], MARGIN_SIZE_MAP[size], LEFT_CLIP_PATH)}>
            <AssetIcon hideBadge={hideBadge} metadata={assets[1]} size={size} />
          </div>
        )}
      </Container>
    );
  }

  return (
    <Container className={cn('relative flex items-center', OVERLAY_SIZE_MAP[size])}>
      {assets?.map((asset, index) => (
        <AssetIcon
          hideBadge={hideBadge}
          metadata={asset}
          key={index}
          size={size}
          zIndex={assets.length - index}
        />
      ))}
    </Container>
  );
};
