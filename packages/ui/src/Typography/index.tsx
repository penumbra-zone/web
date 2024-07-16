import styled, { DefaultTheme } from 'styled-components';

const base = {
  margin: 0,
};

type Spec = typeof base & {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
};

export const STYLES_BY_VARIANT = (theme: DefaultTheme) =>
  ({
    h1: {
      ...base,
      fontFamily: theme.font.heading,
      fontSize: theme.fontSize.text6xl,
      fontWeight: 500,
      lineHeight: theme.lineHeight.text6xl,
    },
    h2: {
      ...base,
      fontFamily: theme.font.heading,
      fontSize: theme.fontSize.text5xl,
      fontWeight: 500,
      lineHeight: theme.lineHeight.text5xl,
    },
    h3: {
      ...base,
      fontFamily: theme.font.heading,
      fontSize: theme.fontSize.text4xl,
      fontWeight: 500,
      lineHeight: theme.lineHeight.text4xl,
    },
    h4: {
      ...base,
      fontFamily: theme.font.heading,
      fontSize: theme.fontSize.text3xl,
      fontWeight: 500,
      lineHeight: theme.lineHeight.text3xl,
    },
    large: {
      ...base,
      fontFamily: theme.font.default,
      fontSize: theme.fontSize.textLg,
      fontWeight: 500,
      lineHeight: theme.lineHeight.textLg,
    },
    body: {
      ...base,
      fontFamily: theme.font.default,
      fontSize: theme.fontSize.textBase,
      fontWeight: 400,
      lineHeight: theme.lineHeight.textBase,
    },
    bodyEmphasized: {
      ...base,
      fontFamily: theme.font.default,
      fontSize: theme.fontSize.textBase,
      fontWeight: 500,
      lineHeight: theme.lineHeight.textBase,
    },
    button: {
      ...base,
      fontFamily: theme.font.default,
      fontSize: theme.fontSize.textBase,
      fontWeight: 500,
      lineHeight: theme.lineHeight.textBase,
    },
    detail: {
      ...base,
      fontFamily: theme.font.default,
      fontSize: theme.fontSize.textXs,
      fontWeight: 500,
      lineHeight: theme.lineHeight.textXs,
    },
    small: {
      ...base,
      fontFamily: theme.font.default,
      fontSize: theme.fontSize.textSm,
      fontWeight: 400,
      lineHeight: theme.lineHeight.textSm,
    },
    tab: {
      ...base,
      fontFamily: theme.font.default,
      fontSize: theme.fontSize.textLg,
      fontWeight: 400,
      lineHeight: theme.lineHeight.textLg,
    },
    tableHeading: {
      ...base,
      fontFamily: theme.font.default,
      fontSize: theme.fontSize.textBase,
      fontWeight: 500,
      lineHeight: theme.lineHeight.textBase,
    },
    tableItem: {
      ...base,
      fontFamily: theme.font.default,
      fontSize: theme.fontSize.textBase,
      fontWeight: 400,
      lineHeight: theme.lineHeight.textBase,
    },
    technical: {
      ...base,
      fontFamily: theme.font.mono,
      fontSize: theme.fontSize.textSm,
      fontWeight: 500,
      lineHeight: theme.lineHeight.textSm,
    },
  }) satisfies Record<string, Spec>;

export const H1 = styled.h1(props => STYLES_BY_VARIANT(props.theme).h1);
export const H2 = styled.h2(props => STYLES_BY_VARIANT(props.theme).h2);
export const H3 = styled.h3(props => STYLES_BY_VARIANT(props.theme).h3);
export const H4 = styled.h4(props => STYLES_BY_VARIANT(props.theme).h4);
export const Large = styled.span(props => STYLES_BY_VARIANT(props.theme).large);
export const Body = styled.span(props => STYLES_BY_VARIANT(props.theme).body);
export const Strong = styled.span(props => STYLES_BY_VARIANT(props.theme).bodyEmphasized);
export const Detail = styled.span(props => STYLES_BY_VARIANT(props.theme).detail);
export const Small = styled.span(props => STYLES_BY_VARIANT(props.theme).small);
export const Technical = styled.span(props => STYLES_BY_VARIANT(props.theme).technical);

/**
 * Renders a styled `<p />` tag with a bottom-margin (unless it's the last
 * child). Aside from the margin, `<P />` is identical to `<Body />`.
 *
 * Note that this is the only component in the entire Penumbra UI library that
 * renders an external margin. It's a convenience for developers who don't want
 * to wrap each `<P />` in a `<div />` with the appropriate margin, or a flex
 * columnn with a gap.
 */
export const P = styled.p(props => {
  const styles = STYLES_BY_VARIANT(props.theme).body;

  return {
    ...styles,
    marginBottom: styles.lineHeight,

    '&:last-child': {
      marginBottom: 0,
    },
  };
});
