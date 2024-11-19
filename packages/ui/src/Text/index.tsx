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
import { TextType } from './types';

export type TextProps = TextType & {
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
 */
export const Text = (props: TextProps) => {
  const classes = getTextOptionClasses(props);
  const SpanElement = props.as ?? 'span';

  if (props.h1) {
    const Element = props.as ?? 'h1';
    return <Element className={cn(h1, classes)}>{props.children}</Element>;
  }
  if (props.h2) {
    const Element = props.as ?? 'h2';
    return <Element className={cn(h2, classes)}>{props.children}</Element>;
  }
  if (props.h3) {
    const Element = props.as ?? 'h3';
    return <Element className={cn(h3, classes)}>{props.children}</Element>;
  }
  if (props.h4) {
    const Element = props.as ?? 'h4';
    return <Element className={cn(h4, classes)}>{props.children}</Element>;
  }

  if (props.xxl) {
    return <SpanElement className={cn(xxl, classes)}>{props.children}</SpanElement>;
  }
  if (props.large) {
    return <SpanElement className={cn(large, classes)}>{props.children}</SpanElement>;
  }
  if (props.strong) {
    return <SpanElement className={cn(strong, classes)}>{props.children}</SpanElement>;
  }
  if (props.detail) {
    return <SpanElement className={cn(detail, classes)}>{props.children}</SpanElement>;
  }
  if (props.xxs) {
    return <SpanElement className={cn(xxs, classes)}>{props.children}</SpanElement>;
  }
  if (props.small) {
    return <SpanElement className={cn(small, classes)}>{props.children}</SpanElement>;
  }
  if (props.detailTechnical) {
    return <SpanElement className={cn(detailTechnical, classes)}>{props.children}</SpanElement>;
  }
  if (props.technical) {
    return <SpanElement className={cn(technical, classes)}>{props.children}</SpanElement>;
  }

  if (props.p) {
    const Element = props.as ?? 'p';
    return <Element className={cn(p, classes)}>{props.children}</Element>;
  }

  return <SpanElement className={cn(body, classes)}>{props.children}</SpanElement>;
};
