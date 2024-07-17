import styled from 'styled-components';
import { detail } from '../utils/typography';

/**
 * Detail text used for small bits of tertiary information.
 *
 * Renders a `<span />` by default; pass the `as` prop to use a different HTML
 * element with the same styling.
 */
export const Detail = styled.span`
  ${detail}
`;
