import { styled, css, DefaultTheme, WebTarget } from 'styled-components';
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
  truncate,
  xxl,
} from '../utils/typography';
import { ReactNode } from 'react';

interface StyledProps {
  $truncate?: boolean;
  $color?: (color: DefaultTheme['color']) => string;
  $align?: 'left' | 'center' | 'right';
  $decoration?: 'line-through' | 'underline';
  $transform?: 'uppercase' | 'lowercase' | 'capitalize';
  $break: false | 'word' | undefined;
}

const textCss = css<StyledProps>`
  ${props => props.$truncate && truncate}
  ${props => props.$align && `text-align: ${props.$align};`}
  ${props => props.$decoration && `text-decoration: ${props.$decoration};`}
  ${props => props.$transform && `text-transform: ${props.$transform};`}
  ${props => props.$break === false && `white-space: nowrap;`}
  ${props => props.$break === 'word' && `word-break: break-word;`}
`;

const H1 = styled.h1<StyledProps>`
  ${h1}
  ${textCss}
`;

const H2 = styled.h2<StyledProps>`
  ${h2}
  ${textCss}
`;

const H3 = styled.h3<StyledProps>`
  ${h3}
  ${textCss}
`;

const H4 = styled.h4<StyledProps>`
  ${h4}
  ${textCss}
`;

const Xxl = styled.span<StyledProps>`
  ${xxl}
  ${textCss}
`;

const Large = styled.span<StyledProps>`
  ${large}
  ${textCss}
`;

const Body = styled.span<StyledProps>`
  ${body}
  ${textCss}
`;

const Strong = styled.span<StyledProps>`
  ${strong}
  ${textCss}
`;

const Detail = styled.span<StyledProps>`
  ${detail}
  ${textCss}
`;

const Small = styled.span<StyledProps>`
  ${small}
  ${textCss}
`;

const DetailTechnical = styled.span<StyledProps>`
  ${detailTechnical}
  ${textCss}
`;

const Technical = styled.span<StyledProps>`
  ${technical}
  ${textCss}
`;

const P = styled.p<StyledProps>`
  ${body}
  ${textCss}

  margin-bottom: ${props => props.theme.lineHeight.textBase};

  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Utility interface to be used below to ensure that only one text type is used
 * at a time.
 */
interface NeverTextTypes {
  h1?: never;
  h2?: never;
  h3?: never;
  h4?: never;
  xxl?: never;
  large?: never;
  p?: never;
  strong?: never;
  detail?: never;
  small?: never;
  detailTechnical?: never;
  technical?: never;
  body?: never;
}

type TextType =
  | (Omit<NeverTextTypes, 'h1'> & {
      /**
       * Renders a styled `<h1 />`. Pass the `as` prop to use a different HTML
       * element with the same styling.
       */
      h1: true;
    })
  | (Omit<NeverTextTypes, 'h2'> & {
      /**
       * Renders a styled `<h2 />`. Pass the `as` prop to use a different HTML
       * element with the same styling.
       */
      h2: true;
    })
  | (Omit<NeverTextTypes, 'h3'> & {
      /**
       * Renders a styled `<h3 />`. Pass the `as` prop to use a different HTML
       * element with the same styling.
       */
      h3: true;
    })
  | (Omit<NeverTextTypes, 'h4'> & {
      /**
       * Renders a styled `<h4 />`. Pass the `as` prop to use a different HTML
       * element with the same styling.
       */
      h4: true;
    })
  | (Omit<NeverTextTypes, 'xxl'> & {
      /**
       * Renders bigger text used for section titles. Renders a `<span />` by
       * default; pass the `as` prop to use a different HTML element with the
       * same styling.
       */
      xxl: true;
    })
  | (Omit<NeverTextTypes, 'large'> & {
      /**
       * Renders big text used for section titles. Renders a `<span />` by
       * default; pass the `as` prop to use a different HTML element with the
       * same styling.
       */
      large: true;
    })
  | (Omit<NeverTextTypes, 'p'> & {
      /**
       * Renders a styled `<p />` tag with a bottom-margin (unless it's the last
       * child). Aside from the margin, `<P />` is identical to `<Body />`.
       *
       * Note that this is the only component in the entire Penumbra UI library
       * that renders an external margin. It's a convenience for developers who
       * don't want to wrap each `<Text p />` in a `<div />` with the
       * appropriate margin, or a flex columnn with a gap.
       */
      p: true;
    })
  | (Omit<NeverTextTypes, 'strong'> & {
      /**
       * Emphasized body text.
       *
       * Renders a `<span />` by default; pass the `as` prop to use a different
       * HTML element with the same styling.
       */
      strong: true;
    })
  | (Omit<NeverTextTypes, 'detail'> & {
      /**
       * Detail text used for small bits of tertiary information.
       *
       * Renders a `<span />` by default; pass the `as` prop to use a different
       * HTML element with the same styling.
       */
      detail: true;
    })
  | (Omit<NeverTextTypes, 'small'> & {
      /**
       * Small text used for secondary information.
       *
       * Renders a `<span />` by default; pass the `as` prop to use a different
       * HTML element with the same styling.
       */
      small: true;
    })
  | (Omit<NeverTextTypes, 'detailTechnical'> & {
      /**
       * Small monospaced text used for code, values, and other technical
       * information.
       *
       * Renders a `<span />` by default; pass the `as` prop to use a different
       * HTML element with the same styling.
       */
      detailTechnical: true;
    })
  | (Omit<NeverTextTypes, 'technical'> & {
      /**
       * Monospaced text used for code, values, and other technical information.
       *
       * Renders a `<span />` by default; pass the `as` prop to use a different
       * HTML element with the same styling.
       */
      technical: true;
    })
  | (Omit<NeverTextTypes, 'body'> & {
      /**
       * Body text used throughout most of our UIs.
       *
       * Renders a `<span />` by default; pass the `as` prop to use a different
       * HTML element with the same styling.
       */
      body?: true;
    });

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
  as?: WebTarget;
  /**
   * When `true`, will apply styles that 1) prevent text wrapping, 2) hide
   * overflow, 3) add an ellpsis when the text overflows.
   */
  truncate?: boolean;
  /**
   * A function that takes the 'color' object of `theme`, and returns a CSS color to render
   * the icon with. If left undefined, will default to the `text.primary` color.
   */
  color?: (color: DefaultTheme['color']) => string;
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
  break?: false | 'word' | undefined;
};

/**
 * Runtime equivalent of TypeScript's `Omit` type. Removes extraneous props that
 * shouldn't be passed to the DOM.
 */
const omit = <ObjectType extends Record<string, unknown>>(
  object: ObjectType,
  key: keyof ObjectType,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- we're discarding the unused key
  const { [key]: _, ...rest } = object;
  return rest;
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
export const Text = ({
  truncate,
  color,
  align,
  decoration,
  transform,
  break: breakProp,
  ...props
}: TextProps) => {
  const styledProps = {
    $truncate: truncate,
    $color: color,
    $align: align,
    $decoration: decoration,
    $transform: transform,
    $break: breakProp,
  };

  if (props.h1) {
    return <H1 {...omit(props, 'h1')} {...styledProps} />;
  }
  if (props.h2) {
    return <H2 {...omit(props, 'h2')} {...styledProps} />;
  }
  if (props.h3) {
    return <H3 {...omit(props, 'h3')} {...styledProps} />;
  }
  if (props.h4) {
    return <H4 {...omit(props, 'h4')} {...styledProps} />;
  }
  if (props.xxl) {
    return <Xxl {...omit(props, 'xxl')} {...styledProps} />;
  }
  if (props.large) {
    return <Large {...omit(props, 'large')} {...styledProps} />;
  }
  if (props.strong) {
    return <Strong {...omit(props, 'strong')} {...styledProps} />;
  }
  if (props.detail) {
    return <Detail {...omit(props, 'detail')} {...styledProps} />;
  }
  if (props.small) {
    return <Small {...omit(props, 'small')} {...styledProps} />;
  }
  if (props.detailTechnical) {
    return <DetailTechnical {...omit(props, 'detailTechnical')} {...styledProps} />;
  }
  if (props.technical) {
    return <Technical {...omit(props, 'technical')} {...styledProps} />;
  }
  if (props.p) {
    return <P {...omit(props, 'p')} {...styledProps} />;
  }

  return <Body {...omit(props, 'body')} {...styledProps} />;
};
