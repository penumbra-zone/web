import { ReactNode } from 'react';
import { Plus, Minus } from 'lucide-react';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { ConditionalWrap } from '../ConditionalWrap';
import { Pill, PillProps } from '../Pill';
import { Text } from '../Text';
import { AssetIcon } from '../AssetIcon';
import { Density, useDensity } from '../utils/density';
import cn from 'clsx';
import { shortify } from '@penumbra-zone/types/shortify';
import { detailTechnical, technical } from '../utils/typography.ts';
import { pnum } from '@penumbra-zone/types/pnum';

type Context = 'default' | 'table';

const ValueText = ({ children, density }: { children: ReactNode; density: Density }) => {
  if (density === 'slim') {
    return <Text detailTechnical>{children}</Text>;
  }

  if (density === 'compact') {
    return <Text smallTechnical>{children}</Text>;
  }

  return <Text technical>{children}</Text>;
};

const getSignColor = (signed?: ValueViewComponentProps<Context>['signed']): string => {
  if (!signed) {
    return '';
  }
  return signed === 'positive' ? 'text-success-light' : 'text-destructive-light';
};

const getSign = (signed: ValueViewComponentProps<Context>['signed']) => {
  const classes = cn('inline size-3', getSignColor(signed));
  return signed === 'positive' ? <Plus className={classes} /> : <Minus className={classes} />;
};

const getPosition = (density: Density, priority: PillProps['priority']): string => {
  if (density === 'slim') {
    return priority === 'tertiary' ? '' : '-ml-1';
  }
  return '-ml-2';
};

const getTextColor = (textColor?: string, fallback = 'text-text-primary'): string => {
  return textColor && textColor.trim().length > 0 ? `text-${textColor}` : fallback;
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
   * Renders the plus or minus sign in front of a number and colors it green or red depending on the sign.
   * If `undefined`, renders in without a sign and in regular color.
   */
  signed?: 'positive' | 'negative';
  /**
   * If true, the asset icon will be visible.
   */
  showIcon?: boolean;
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
  /**
   * If true, the amount will have trailing zeros. The length of the decimal number part
   * will become the exponent of the passed token.
   */
  trailingZeros?: boolean;
  /**
   * Add "figure space &numsp;" characters to the formatted amount until this length is reached,
   * useful for aligning numbers in a table.
   *
   * For example, if the formatted amount is "1,000.23" (length 8) and `padStart` is 10, the resulting
   * string will be "  1,000.23" (length 10).
   */
  padStart?: number;
  /**
   * The density to use for the component. If not provided, the density will be
   * determined by the `Density` context.
   */
  density?: Density;
  /**
   * Custom text color for the value and symbol. When provided, overrides default colors.
   * Accepts the same color values as the Text component (e.g., 'destructive.light', 'text.secondary').
   */
  textColor?: string;
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
  signed,
  padStart,
  showIcon = true,
  showSymbol = true,
  abbreviate = false,
  showValue = true,
  trailingZeros = false,
  density: densityProps,
  textColor,
}: ValueViewComponentProps<SelectedContext>) => {
  const densityContext = useDensity();
  const density = densityProps ?? densityContext;

  if (!valueView) {
    return null;
  }

  const formattedAmount = abbreviate
    ? shortify(pnum(valueView).toNumber())
    : pnum(valueView).toFormattedString({ trailingZeros });

  const figureSpace = ' '; // figure space character, not a regular space
  const padString = padStart
    ? figureSpace.repeat(Math.max(0, padStart - formattedAmount.length))
    : '';

  const metadata = getMetadata.optional(valueView);
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- possibly empty string
  const symbol = metadata?.symbol || 'Unknown';

  return (
    <ConditionalWrap
      if={!context || context === 'default'}
      then={children => (
        <Pill priority={priority}>
          <div className={getPosition(density, priority)}>{children}</div>
        </Pill>
      )}
      else={children => (
        <span
          className={cn(
            density === 'sparse' ? technical : detailTechnical,
            getTextColor(textColor),
          )}
        >
          {children}
        </span>
      )}
    >
      <span className={cn('flex w-max max-w-full items-center text-ellipsis', getGap(density))}>
        {showIcon && (
          <div className='shrink-0'>
            <AssetIcon
              hideBadge={!symbol.startsWith('delUM')}
              isDelegated={symbol.startsWith('delUM')}
              size={getIconSize(density)}
              metadata={metadata}
            />
          </div>
        )}

        <div
          className={cn(
            'grow shrink flex items-center overflow-hidden',
            context === 'table' &&
              priority === 'secondary' &&
              'border-b-2 border-dashed border-other-tonalStroke',
            getGap(density),
            getTextColor(textColor, getSignColor(signed)),
          )}
        >
          {showValue && (
            <div className='flex shrink grow items-center' title={formattedAmount}>
              {signed && getSign(signed)}
              <ValueText density={density}>
                {padString}
                {formattedAmount}
              </ValueText>
            </div>
          )}
          {showSymbol && (
            <div className='max-w-24 shrink grow truncate' title={symbol}>
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
  if (density === 'compact') {
    return 'gap-1.5';
  }
  return 'gap-1';
};

const getIconSize = (density: Density) => {
  if (density === 'sparse') {
    return 'lg';
  }
  if (density === 'compact') {
    return 'md';
  }
  return 'sm';
};
