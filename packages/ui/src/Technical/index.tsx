import styled from 'styled-components';
import { technical } from '../utils/typography';

/**
 * Monospaced text used for code, values, and other technical information.
 *
 * Renders a `<span />` by default; pass the `as` prop to use a different HTML
 * element with the same styling.
 */
export const Technical = styled.span`
  ${technical}
`;
