import styled from 'styled-components';

/**
 * Utility component for wrapping other markup in a `flex-shrink: 0` container.
 * Useful for e.g., icons/etc. whose size should be preserved.
 */
export const Shrink0 = styled.div`
  flex-shrink: 0;
`;
