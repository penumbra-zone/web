import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { AsTransientProps, asTransientProps } from '../utils/asTransientProps';
import { media } from '../utils/media';

type GridElement = 'div' | 'main' | 'section';

interface BaseGridProps extends Record<string, unknown> {
  /** Which element to use. Defaults to `'div'`. */
  as?: GridElement;
}

interface GridContainerProps extends BaseGridProps {
  /** Whether this is a grid container, vs. an item. */
  container: true;
}

interface GridItemProps extends BaseGridProps {
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
  ${props => media.mobile`
    grid-column: span ${props.$mobile ?? 12};
  `}

  ${props =>
    props.$tablet &&
    media.tablet`
      grid-column: span ${props.$tablet};
    `}

  ${props =>
    props.$desktop &&
    media.desktop`
      grid-column: span ${props.$desktop};
    `}

  ${props =>
    props.$lg &&
    media.lg`
      grid-column: span ${props.$lg};
    `}

  ${props =>
    props.$xl &&
    media.xl`
      grid-column: span ${props.$xl};
    `}
`;

/**
 * A responsive grid component that makes 12-column layouts super easy to build.
 *
 * Pass the `container` prop to the root `<Grid />` component; then, any nested
 * children `<Grid />`s will be treated as grid items. You can customize which
 * HTML element to use for each grid container or item by passing the element's
 * name via the optional `as` prop.
 *
 * Use the `<Grid />` component — rather than styling your own HTML elements
 * with `display: grid` — to ensure consistent behavior (such as grid gutters)
 * throughout your app.
 *
 * @example
 * ```tsx
 * <Grid container as="main">
 *   <Grid mobile={12} as="section">This will span the full width on all screen sizes.</Grid>
 *
 *   <Grid>So will this.</Grid>
 *
 *   <Grid mobile={12} desktop={6}>
 *     These will span the full width on mobile...
 *   </Grid>
 *
 *   <Grid mobile={12} desktop={6}>
 *     ...but half the width on desktop.
 *   </Grid>
 *
 *   <Grid mobile={4}>
 *     These will...
 *   </Grid>
 *
 *   <Grid mobile={4}>
 *     ...take up...
 *   </Grid>
 *
 *   <Grid mobile={4}>
 *     ...one third each.
 *   </Grid>
 * </Grid>
 * ```
 */
export const Grid = ({ container, children, as = 'div', ...props }: GridProps) =>
  container ? (
    <Container as={as}>{children}</Container>
  ) : (
    <Item {...asTransientProps(props)} as={as}>
      {children}
    </Item>
  );
