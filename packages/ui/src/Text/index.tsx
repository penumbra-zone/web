import cn from 'clsx';

import {
  body,
  detail,
  h1,
  h2,
  h3,
  h4,
  large,
  small,
  detailTechnical,
  strong,
  technical,
  xxl,
  p,
  getTextBase,
  xxs,
} from '../utils/typography';
import { ElementType, ReactNode } from 'react';
import { ThemeColor } from '../utils/color';
import { TextVariant, TypographyProps } from './types';

export type TextProps = TypographyProps & {
  children?: ReactNode;
  /**
   * Which component or HTML element to render this text as.
   *
   * @example
   * ```tsx
   * <Text h1 as='span'>This is a span with H1 styling</Text>
   * ```
   */
  as?: ElementType;
  /**
   * When `true`, will apply styles that 1) prevent text wrapping, 2) hide
   * overflow, 3) add an ellpsis when the text overflows.
   */
  truncate?: boolean;
  /** A string representing the color key from the Tailwind theme (e.g. 'primary.light') */
  color?: ThemeColor;
  /**
   * The text alignment
   */
  align?: 'left' | 'center' | 'right';
  /**
   * The text decoration
   */
  decoration?: 'line-through' | 'underline';
  /**
   * The text transform
   */
  transform?: 'uppercase' | 'lowercase' | 'capitalize';
  /**
   * Controls how the text breaks.
   */
  break?: 'words' | 'all' | 'keep';
  /**
   * Controls how whitespace is handled.
   */
  whitespace?: 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap' | 'break-spaces';
};

const ALIGN_MAP: Record<Required<TextProps>['align'], string> = {
  center: cn('text-center'),
  left: cn('text-left'),
  right: cn('text-right'),
};

const DECORATION_MAP: Record<Required<TextProps>['decoration'], string> = {
  'line-through': cn('line-through'),
  underline: cn('underline'),
};

const TRANSFORM_MAP: Record<Required<TextProps>['transform'], string> = {
  uppercase: cn('uppercase'),
  lowercase: cn('lowercase'),
  capitalize: cn('capitalize'),
};

const BREAK_MAP: Record<Required<TextProps>['break'], string> = {
  all: cn('break-all'),
  words: cn('break-words'),
  keep: cn('break-keep'),
};

const WHITESPACE_MAP: Record<Required<TextProps>['whitespace'], string> = {
  nowrap: cn('whitespace-nowrap'),
  pre: cn('whitespace-pre'),
  'pre-line': cn('whitespace-pre-line'),
  'pre-wrap': cn('whitespace-pre-wrap'),
  'break-spaces': cn('whitespace-break-spaces'),
};

// Composes all props to the Tailwind class list
const getTextOptionClasses = ({
  color,
  truncate,
  align,
  decoration,
  transform,
  break: breakProp,
  whitespace,
}: TextProps): string => {
  const truncateClass = truncate ? cn('truncate') : '';
  const alignClass = align && ALIGN_MAP[align];
  const decorationClass = decoration && DECORATION_MAP[decoration];
  const transformClass = transform && TRANSFORM_MAP[transform];
  const breakClass = breakProp && BREAK_MAP[breakProp];
  const whitespaceClass = whitespace && WHITESPACE_MAP[whitespace];

  return cn(
    getTextBase(color),
    truncateClass,
    alignClass,
    decorationClass,
    transformClass,
    breakClass,
    whitespaceClass,
  );
};

const VARIANT_MAP: Record<TextVariant, { element: ElementType; classes: string }> = {
  h1: { element: 'h1', classes: h1 },
  h2: { element: 'h2', classes: h2 },
  h3: { element: 'h3', classes: h3 },
  h4: { element: 'h4', classes: h4 },
  xxl: { element: 'span', classes: xxl },
  large: { element: 'span', classes: large },
  p: { element: 'p', classes: p },
  strong: { element: 'span', classes: strong },
  detail: { element: 'span', classes: detail },
  xxs: { element: 'span', classes: xxs },
  small: { element: 'span', classes: small },
  detailTechnical: { element: 'span', classes: detailTechnical },
  technical: { element: 'span', classes: technical },
  body: { element: 'span', classes: body },
};

/**
 * All-purpose text wrapper for quickly styling text per the Penumbra UI
 * guidelines.
 *
 * Use with a _single_ text style name:
 *
 * ```tsx
 * <Text h1>This will be rendered with the `h1` style.</Text>
 * <Text body>This will be rendered with the `body` style.</Text>
 * <Text h1 body>
 *   INCORRECT: This will result in a TypeScript error. Only use one text style
 *   at a time.
 * </Text>
 * ```
 *
 * When no text style is passed, it will render using the `body` style.
 *
 * The heading text styles are rendered as their corresponding heading tags
 * (`<h1 />`, `<h2 />`, etc.), and the `p` style is rendered as a `<p />` tag.
 * All other styles are rendered as `<span />`s. To customize which tag is
 * rendered without affecting its appearance, use the `as` prop:
 *
 * ```tsx
 * <Text h1 as='span'>
 *   This will render with the h1 style, but inside an inline span tag.
 * </Text>
 * ```
 *
 * If you need to use dynamic Text styles, use `variant` property with a string value.
 * However, it is recommended to use the static Text styles for most cases:
 *
 * ```tsx
 * <Text variant={emphasized ? 'strong' : 'body'}>Content</Text>
 * ```
 */
export const Text = (props: TextProps) => {
  const classes = getTextOptionClasses(props);

  const variantKey: TextVariant =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the default fallback is necessary
    (Object.keys(props).find(key => VARIANT_MAP[key as TextVariant]) as TextVariant) ?? 'body';
  const variant = VARIANT_MAP[variantKey];
  const Element = props.as ?? variant.element;

  return <Element className={cn(variant.classes, classes)}>{props.children}</Element>;
};
