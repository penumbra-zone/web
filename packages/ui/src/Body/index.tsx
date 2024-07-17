import styled from 'styled-components';
import { body } from '../utils/typography';

/**
 * Body text used throughout most of our UIs.
 *
 * Renders a `<span />` by default; pass the `as` prop to use a different HTML
 * element with the same styling.
 */
export const Body = styled.span`
  ${body}
`;
