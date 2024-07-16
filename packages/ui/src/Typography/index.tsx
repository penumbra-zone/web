import styled from 'styled-components';

const base = `
  margin: 0;
`;

export const H1 = styled.h1`
  ${base}

  font-family: ${props => props.theme.font.heading};
  font-size: ${props => props.theme.fontSize.text6xl};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.text6xl};
`;

export const H2 = styled.h2`
  ${base}

  font-family: ${props => props.theme.font.heading};
  font-size: ${props => props.theme.fontSize.text5xl};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.text5xl};
`;

export const H3 = styled.h3`
  ${base}

  font-family: ${props => props.theme.font.heading};
  font-size: ${props => props.theme.fontSize.text4xl};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.text4xl};
`;

export const H4 = styled.h4`
  ${base}

  font-family: ${props => props.theme.font.heading};
  font-size: ${props => props.theme.fontSize.text3xl};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.text3xl};
`;

export const Large = styled.span`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textLg};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.textLg};
`;

export const Body = styled.span`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textBase};
  font-weight: 400;
  line-height: ${props => props.theme.lineHeight.textBase};
`;

export const Strong = styled.span`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textBase};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.textBase};
`;

export const Detail = styled.span`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textXs};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.textXs};
`;

export const Small = styled.span`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textSm};
  font-weight: 400;
  line-height: ${props => props.theme.lineHeight.textSm};
`;

export const Technical = styled.span`
  ${base}

  font-family: ${props => props.theme.font.mono};
  font-size: ${props => props.theme.fontSize.textSm};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.textSm};
`;

/**
 * Renders a styled `<p />` tag with a bottom-margin (unless it's the last
 * child). Aside from the margin, `<P />` is identical to `<Body />`.
 *
 * Note that this is the only component in the entire Penumbra UI library that
 * renders an external margin. It's a convenience for developers who don't want
 * to wrap each `<P />` in a `<div />` with the appropriate margin, or a flex
 * columnn with a gap.
 */
export const P = styled(Body).attrs({ as: 'p' })`
  margin-bottom: ${props => props.theme.lineHeight.textBase};

  &:last-child {
    margin-bottom: 0;
  }
`;
