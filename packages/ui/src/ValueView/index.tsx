import { ReactNode } from 'react';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { ConditionalWrap } from '../ConditionalWrap';
import { Pill, PillProps } from '../Pill';
import { Text } from '../Text';
import { AssetIcon } from '../AssetIcon';
import { Density, useDensity } from '../utils/density';
import cn from 'clsx';
import { shortify } from '@penumbra-zone/types/shortify';
import { detailTechnical, technical } from '../utils/typography.ts';

type Context = 'default' | 'table';

const ValueText = ({ children, density }: { children: ReactNode; density: Density }) => {
  if (density === 'sparse') {
    return <Text body>{children}</Text>;
  }

  return <Text detail>{children}</Text>;
};

export interface ValueViewComponentProps<SelectedContext extends Context> {
  valueView?: ValueView;
  /**
   * A `ValueViewComponent` will be rendered differently depending on which
   * context it's rendered in. By default, it'll be rendered in a pill. But in a
   * table context, it'll be rendered as just an icon and text.
   */
  context?: SelectedContext;
  /**
   * Use `primary` in most cases, or `secondary` when this value view
   * represents a secondary value, such as when it's an equivalent value of a
   * numeraire.
   */
  priority?: PillProps['priority'];
  /**
   * If true, the asset symbol will be visible.
   */
  showSymbol?: boolean;
  /**
   * If true, the displayed amount will be shortened.
   */
  abbreviate?: boolean;
  /**
   * If false, the amount will not be displayed.
   */
  showValue?: boolean;
}

/**
 * `ValueViewComponent` renders a `ValueView` — its amount, icon, and symbol.
 * Use this anywhere you would like to render a `ValueView`.
 *
 * Note that `ValueViewComponent` only has density variants when the `context`
 * is `default`. For the `table` context, there is only one density.
 */
export const ValueViewComponent = <SelectedContext extends Context = 'default'>({
  valueView,
  context,
  priority = 'primary',
  showSymbol = true,
  abbreviate = false,
  showValue = true,
}: ValueViewComponentProps<SelectedContext>) => {
  const density = useDensity();

  if (!valueView) {
    return null;
  }

  let formattedAmount: string | undefined;
  if (showValue) {
    const amount = getFormattedAmtFromValueView(valueView, !abbreviate);
    formattedAmount = abbreviate ? shortify(Number(amount)) : amount;
  }

  const metadata = getMetadata.optional(valueView);
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- possibly empty string
  const symbol = metadata?.symbol || 'Unknown';

  return (
    <ConditionalWrap
      if={!context || context === 'default'}
      then={children => (
        <Pill priority={priority}>
          <div className={cn('-ml-2', density === 'sparse' ? 'mt-0 mb-0' : '-mt-1 -mb-1')}>
            {children}
          </div>
        </Pill>
      )}
      else={children => (
        <span
          className={cn(density === 'sparse' ? technical : detailTechnical, 'text-text-primary')}
        >
          {children}
        </span>
      )}
    >
      <span className={cn('flex w-max max-w-full items-center text-ellipsis', getGap(density))}>
        <div className='shrink-0'>
          <AssetIcon size={getIconSize(density)} metadata={metadata} />
        </div>

        <div
          className={cn(
            'grow shrink flex items-center overflow-hidden',
            context === 'table' &&
              priority === 'secondary' &&
              'border-b-2 border-dashed border-other-tonalStroke',
            getGap(density),
          )}
        >
          {showValue && (
            <div className='shrink grow' title={formattedAmount ?? undefined}>
              <ValueText density={density}>{formattedAmount}</ValueText>
            </div>
          )}
          {showSymbol && (
            <div className='shrink grow truncate' title={symbol}>
              <ValueText density={density}>{symbol}</ValueText>
            </div>
          )}
        </div>
      </span>
    </ConditionalWrap>
  );
};

const getGap = (density: Density) => {
  if (density === 'sparse') {
    return 'gap-2';
  }
  if (density === 'medium') {
    return 'gap-1.5';
  }
  return 'gap-1';
};

const getIconSize = (density: Density) => {
  if (density === 'sparse') {
    return 'lg';
  }
  if (density === 'medium') {
    return 'md';
  }
  return 'sm';
};
