import { ReactNode } from 'react';
import styled from 'styled-components';
import { media } from '../utils/media';

const Root = styled.section`
  padding: 0 ${props => props.theme.spacing(4)};

  ${props => media.desktop`
    padding: 0 ${props.theme.spacing(8)};
  `}
`;

const ContentsWrapper = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

export interface DisplayProps {
  children?: ReactNode;
}

/**
 * Wrap your top-level component for a given page (usually a `<Grid />`) in
 * `<Diplay />` to adhere to PenumbraUI guidelines regarding maximum layouts
 * widths, horizontal margins, etc.
 *
 * ```tsx
 * <Display>
 *   <Grid container>
 *     <Grid tablet={6}>Column one</Grid>
 *     <Grid tablet={6}>Column two</Grid>
 *   </Grid>
 * </Display>
 * ```
 */
export const Display = ({ children }: DisplayProps) => {
  return (
    <Root>
      <ContentsWrapper>{children}</ContentsWrapper>
    </Root>
  );
};
