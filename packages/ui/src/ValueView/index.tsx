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
}: ValueViewComponentProps<SelectedContext>) => {
  const density = useDensity();

  if (!valueView) {
    return null;
  }

  const formattedAmount = getFormattedAmtFromValueView(valueView, true);
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
    >
      <span className='flex w-max max-w-full items-center gap-2 text-ellipsis'>
        <div className='shrink-0'>
          <AssetIcon size={density === 'sparse' ? 'lg' : 'md'} metadata={metadata} />
        </div>

        <div
          className={cn(
            'grow shrink flex items-center gap-2 overflow-hidden',
            context === 'table' &&
              priority === 'secondary' &&
              'border-b-2 border-dashed border-other-tonalStroke',
          )}
        >
          <div className='min-w-[50px] shrink grow truncate' title={formattedAmount}>
            <ValueText density={density}>{formattedAmount} </ValueText>
          </div>
          <div className='min-w-[50px] shrink grow truncate' title={symbol}>
            <ValueText density={density}>{symbol}</ValueText>
          </div>
        </div>
      </span>
    </ConditionalWrap>
  );
};
