import { Box } from '@mui/system';
import { PropsWithChildren } from 'react';
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
      fontFamily: theme.fonts.heading,
      fontSize: theme.fontSizes.text6xl,
      fontWeight: 500,
      lineHeight: '3.75rem',
    },
    h2: {
      ...base,
      fontFamily: theme.fonts.heading,
      fontSize: theme.fontSizes.text5xl,
      fontWeight: 500,
      lineHeight: '3rem',
    },
    h3: {
      ...base,
      fontFamily: theme.fonts.heading,
      fontSize: theme.fontSizes.text4xl,
      fontWeight: 500,
      lineHeight: '2.5rem',
    },
    h4: {
      ...base,
      fontFamily: theme.fonts.heading,
      fontSize: theme.fontSizes.text3xl,
      fontWeight: 500,
      lineHeight: '2.25rem',
    },
    large: {
      ...base,
      fontFamily: theme.fonts.default,
      fontSize: theme.fontSizes.textLg,
      fontWeight: 500,
      lineHeight: '1.75rem',
    },
    body: {
      ...base,
      fontFamily: theme.fonts.default,
      fontSize: theme.fontSizes.textBase,
      fontWeight: 400,
      lineHeight: '1.5rem',
    },
    bodyEmphasized: {
      ...base,
      fontFamily: theme.fonts.default,
      fontSize: theme.fontSizes.textBase,
      fontWeight: 500,
      lineHeight: '1.5rem',
    },
    button: {
      ...base,
      fontFamily: theme.fonts.default,
      fontSize: theme.fontSizes.textBase,
      fontWeight: 500,
      lineHeight: '1.5rem',
    },
    detail: {
      ...base,
      fontFamily: theme.fonts.default,
      fontSize: theme.fontSizes.textXs,
      fontWeight: 500,
      lineHeight: '1rem',
    },
    small: {
      ...base,
      fontFamily: theme.fonts.default,
      fontSize: theme.fontSizes.textSm,
      fontWeight: 400,
      lineHeight: '1.25rem',
    },
    tab: {
      ...base,
      fontFamily: theme.fonts.default,
      fontSize: theme.fontSizes.textLg,
      fontWeight: 400,
      lineHeight: '1.75rem',
    },
    tableHeading: {
      ...base,
      fontFamily: theme.fonts.default,
      fontSize: theme.fontSizes.textBase,
      fontWeight: 500,
      lineHeight: '1.5rem',
    },
    tableItem: {
      ...base,
      fontFamily: theme.fonts.default,
      fontSize: theme.fontSizes.textBase,
      fontWeight: 400,
      lineHeight: '1.5rem',
    },
    technical: {
      ...base,
      fontFamily: theme.fonts.mono,
      fontSize: theme.fontSizes.textSm,
      fontWeight: 500,
      lineHeight: '1.25rem',
    },
  }) satisfies Record<string, Spec>;

export const H1 = styled.h1(props => STYLES_BY_VARIANT(props.theme).h1);
export const H2 = styled.h2(props => STYLES_BY_VARIANT(props.theme).h2);
export const H3 = styled.h3(props => STYLES_BY_VARIANT(props.theme).h3);
export const H4 = styled.h4(props => STYLES_BY_VARIANT(props.theme).h4);
export const Large = styled.span(props => STYLES_BY_VARIANT(props.theme).large);
export const Body = ({ children }: PropsWithChildren) => (
  <Box sx={{ typography: 'h1' }}>{children}</Box>
); //styled.span(props => STYLES_BY_VARIANT(props.theme).body);
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
