import styled from 'styled-components';
import { small } from '../utils/typography';

/**
 * Small text used for secondary information.
 *
 * Renders a `<span />` by default; pass the `as` prop to use a different HTML
 * element with the same styling.
 */
export const Small = styled.span`
  ${small}
`;
