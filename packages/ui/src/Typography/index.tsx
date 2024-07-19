import styled from 'styled-components';
import { body, detail, h1, h2, h3, h4, large, small, strong, technical } from '../utils/typography';

export const H1 = styled.h1`
  ${h1}
`;

export const H2 = styled.h2`
  ${h2}
`;

export const H3 = styled.h3`
  ${h3}
`;

export const H4 = styled.h4`
  ${h4}
`;

export const Large = styled.span`
  ${large}
`;

export const Body = styled.span`
  ${body}
`;

export const Strong = styled.span`
  ${strong}
`;

export const Detail = styled.span`
  ${detail}
`;

export const Small = styled.span`
  ${small}
`;

export const Technical = styled.span`
  ${technical}
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
export const P = styled.p`
  ${body}

  margin-bottom: ${props => props.theme.lineHeight.textBase};

  &:last-child {
    margin-bottom: 0;
  }
`;
