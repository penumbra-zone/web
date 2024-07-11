import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { AsTransientProps, asTransientProps } from '../utils/asTransientProps';

interface GridContainerProps {
  /** Whether this is a grid container, vs. an item. */
  container: true;
}

interface GridItemProps extends Record<string, unknown> {
  /** Whether this is a grid container, vs. an item. */
  container?: false;
  /**
   * The number of columns this grid item should span on mobile.
   *
   * The mobile grid layout can only be split in half, so you can only set a
   * grid item to 6 or 12 columns on mobile.
   */
  mobile?: 6 | 12;
  /**
   * The number of columns this grid item should span on tablet.
   *
   * The tablet grid layout can only be split into six columns.
   */
  tablet?: 2 | 4 | 6 | 8 | 10 | 12;
  /** The number of columns this grid item should span on desktop. */
  desktop?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** The number of columns this grid item should span on large screens. */
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** The number of columns this grid item should span on XL screens. */
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

export type GridProps = PropsWithChildren<GridContainerProps | GridItemProps>;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: ${props => props.theme.spacing(4)};
`;

const Item = styled.div<AsTransientProps<Exclude<GridItemProps, 'container'>>>`
  @media (min-width: ${props => props.theme.breakpoints.mobile}px) {
    grid-column: span ${props => props.$mobile ?? 12};
  }

  ${props =>
    props.$tablet
      ? `
          @media (min-width: ${props.theme.breakpoints.tablet}px) {
            grid-column: span ${props.$tablet};
          }
        `
      : ''}

  ${props =>
    props.$desktop
      ? `
          @media (min-width: ${props.theme.breakpoints.desktop}px) {
            grid-column: span ${props.$desktop};
          }
        `
      : ''}

  ${props =>
    props.$lg
      ? `
          @media (min-width: ${props.theme.breakpoints.lg}px) {
            grid-column: span ${props.$lg};
          }
        `
      : ''}

  ${props =>
    props.$xl
      ? `
          @media (min-width: ${props.theme.breakpoints.xl}px) {
            grid-column: span ${props.$xl};
          }
        `
      : ''}
`;

export const Grid = ({ container, children, ...props }: GridProps) =>
  container ? (
    <Container>{children}</Container>
  ) : (
    <Item {...asTransientProps(props)}>{children}</Item>
  );
