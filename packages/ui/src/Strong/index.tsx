import styled from 'styled-components';
import { strong } from '../utils/typography';

/**
 * Emphasized body text.
 *
 * Renders a `<span />` by default; pass the `as` prop to use a different HTML
 * element with the same styling.
 */
export const Strong = styled.span`
  ${strong}
`;
