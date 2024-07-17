import styled from 'styled-components';
import { body } from '../utils/typography';

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
