import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { AssetIcon } from '../asset-icon';
import { Pill } from '../pill';
import { cn } from '../../../lib/utils';

interface ValueComponentProps {
  formattedAmount: string;
  symbol: string;
  metadata?: Metadata;
  variant: 'default' | 'equivalent';
  showIcon: boolean;
  showValue: boolean;
  showDenom: boolean;
  size: 'default' | 'sm';
}

export const ValueComponent = ({
  formattedAmount,
  symbol,
  metadata,
  variant,
  showIcon,
  showValue,
  showDenom,
  size,
}: ValueComponentProps) => (
  <Pill variant={variant === 'default' ? 'default' : 'dashed'}>
    <div className='flex min-w-0 items-center gap-1'>
      {showIcon && (
        <div className='-ml-2 mr-1 flex shrink-0 items-center justify-center rounded-full'>
          <AssetIcon metadata={metadata} size={size === 'default' ? 'sm' : 'xs'} />
        </div>
      )}
      {showValue && (
        <span className={cn('-mb-0.5 text-nowrap leading-[15px]', size === 'sm' && 'text-xs')}>
          {variant === 'equivalent' && <>~ </>}
          {formattedAmount}
        </span>
      )}
      {showDenom && (
        <span className='truncate font-mono text-xs text-muted-foreground'>{symbol}</span>
      )}
    </div>
  </Pill>
);
