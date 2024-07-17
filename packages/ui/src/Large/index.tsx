import styled from 'styled-components';
import { large } from '../utils/typography';

/**
 * Renders bigger text used for section titles. Renders a `<span />` by default;
 * pass the `as` prop to use a different HTML element with the same styling.
 */
export const Large = styled.span`
  ${large}
`;
