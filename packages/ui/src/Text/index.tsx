import styled, { css, DefaultTheme, WebTarget } from 'styled-components';
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
  $color?: (theme: DefaultTheme) => string;
}

const maybeTruncate = css<StyledProps>`
  ${props => props.$truncate && truncate}
`;

const H1 = styled.h1<StyledProps>`
  ${h1}
  ${maybeTruncate}
`;

const H2 = styled.h2<StyledProps>`
  ${h2}
  ${maybeTruncate}
`;

const H3 = styled.h3<StyledProps>`
  ${h3}
  ${maybeTruncate}
`;

const H4 = styled.h4<StyledProps>`
  ${h4}
  ${maybeTruncate}
`;

const Xxl = styled.span<StyledProps>`
  ${xxl}
  ${maybeTruncate}
`;

const Large = styled.span<StyledProps>`
  ${large}
  ${maybeTruncate}
`;

const Body = styled.span<StyledProps>`
  ${body}
  ${maybeTruncate}
`;

const Strong = styled.span<StyledProps>`
  ${strong}
  ${maybeTruncate}
`;

const Detail = styled.span<StyledProps>`
  ${detail}
  ${maybeTruncate}
`;

const Small = styled.span<StyledProps>`
  ${small}
  ${maybeTruncate}
`;

const DetailTechnical = styled.span<StyledProps>`
  ${detailTechnical}
  ${maybeTruncate}
`;

const Technical = styled.span<StyledProps>`
  ${technical}
  ${maybeTruncate}
`;

const P = styled.p<StyledProps>`
  ${body}
  ${maybeTruncate}

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
   * A function that takes the `theme` object, and returns a CSS color to render
   * the icon with. If left undefined, will default to the `text.primary` color.
   */
  color?: (theme: DefaultTheme) => string;
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
export const Text = ({ truncate, color, ...props }: TextProps) => {
  if (props.h1) {
    return <H1 {...omit(props, 'h1')} $truncate={truncate} $color={color} />;
  }
  if (props.h2) {
    return <H2 {...omit(props, 'h2')} $truncate={truncate} $color={color} />;
  }
  if (props.h3) {
    return <H3 {...omit(props, 'h3')} $truncate={truncate} $color={color} />;
  }
  if (props.h4) {
    return <H4 {...omit(props, 'h4')} $truncate={truncate} $color={color} />;
  }
  if (props.xxl) {
    return <Xxl {...omit(props, 'xxl')} $truncate={truncate} $color={color} />;
  }
  if (props.large) {
    return <Large {...omit(props, 'large')} $truncate={truncate} $color={color} />;
  }
  if (props.strong) {
    return <Strong {...omit(props, 'strong')} $truncate={truncate} $color={color} />;
  }
  if (props.detail) {
    return <Detail {...omit(props, 'detail')} $truncate={truncate} $color={color} />;
  }
  if (props.small) {
    return <Small {...omit(props, 'small')} $truncate={truncate} $color={color} />;
  }
  if (props.detailTechnical) {
    return (
      <DetailTechnical {...omit(props, 'detailTechnical')} $truncate={truncate} $color={color} />
    );
  }
  if (props.technical) {
    return <Technical {...omit(props, 'technical')} $truncate={truncate} $color={color} />;
  }
  if (props.p) {
    return <P {...omit(props, 'p')} $truncate={truncate} $color={color} />;
  }

  return <Body {...omit(props, 'body')} $truncate={truncate} $color={color} />;
};
