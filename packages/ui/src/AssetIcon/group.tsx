import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ElementType } from 'react';
import cn from 'clsx';
import { Size, AssetIcon } from './index';

export interface AssetGroupProps {
  assets?: Metadata[];
  as?: ElementType;
  size?: Size;
  variant?: 'overlay' | 'split';
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

export const AssetGroup = ({ assets, as: Container = 'div', size = 'md', variant = 'overlay' }: AssetGroupProps) => {
  if (variant === 'split') {
    return (<Container className={cn('relative flex items-center gap-[1px]')}>
      {assets?.[0] && (
        <div className={cn(SPLIT_SIZE_MAP[size], 'overflow-hidden')}>
          <AssetIcon metadata={assets[0]} size={size} />
        </div>
      )}
      {assets?.[1] && (
        <div className={cn(SPLIT_SIZE_MAP[size], 'overflow-hidden [&>*]:-translate-x-1/2')}>
          <AssetIcon metadata={assets[1]} size={size} />
        </div>
      )}
    </Container>);
  }

  return (
    <Container className={cn('relative flex items-center', OVERLAY_SIZE_MAP[size])}>
      {assets?.map((asset, index) => (
        <AssetIcon metadata={asset} key={index} size={size} zIndex={assets.length - index} />
      ))}
    </Container>
  )
};
