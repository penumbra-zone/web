import { PropsWithChildren } from 'react';
import cn from 'clsx';

type GridElement = 'div' | 'main' | 'section';

interface BaseGridProps extends Record<string, unknown> {
  /** Which element to use. Defaults to `'div'`. */
  as?: GridElement;
}

interface GridContainerProps extends BaseGridProps {
  /** Whether this is a grid container, vs. an item. */
  container: true;

  // For some reason, Storybook needs these properties to be defined on the
  // container props interface in order to show their typings properly.
  mobile?: undefined;
  tablet?: undefined;
  desktop?: undefined;
  lg?: undefined;
  xl?: undefined;
}

interface GridItemProps extends BaseGridProps {
  /** Whether this is a grid container, vs. an item. */
  container?: false;
  /**
   * The number of columns this grid item should span on mobile.
   *
   * The mobile grid layout can only be split in half, so you can only set a
   * grid item to 6 or 12 columns on mobile. 0 hides the container from mobile screens.
   */
  mobile?: 0 | 6 | 12;
  /**
   * The number of columns this grid item should span on tablet.
   *
   * The tablet grid layout can only be split into six columns.
   */
  tablet?: 0 | 2 | 4 | 6 | 8 | 10 | 12;
  /** The number of columns this grid item should span on desktop. */
  desktop?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** The number of columns this grid item should span on large screens. */
  lg?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** The number of columns this grid item should span on XL screens. */
  xl?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

const MOBILE_MAP: Record<Required<GridItemProps>['mobile'], string> = {
  0: 'hidden',
  6: 'col-span-6',
  12: 'col-span-12',
};

const TABLET_MAP: Record<Required<GridItemProps>['tablet'], string> = {
  0: 'tablet:hidden',
  2: 'tablet:col-span-2',
  4: 'tablet:col-span-4',
  6: 'tablet:col-span-6',
  8: 'tablet:col-span-8',
  10: 'tablet:col-span-10',
  12: 'tablet:col-span-12',
};

const DESKTOP_MAP: Record<Required<GridItemProps>['desktop'], string> = {
  0: 'desktop:hidden',
  1: 'desktop:col-span-1',
  2: 'desktop:col-span-2',
  3: 'desktop:col-span-3',
  4: 'desktop:col-span-4',
  5: 'desktop:col-span-5',
  6: 'desktop:col-span-6',
  7: 'desktop:col-span-7',
  8: 'desktop:col-span-8',
  9: 'desktop:col-span-9',
  10: 'desktop:col-span-10',
  11: 'desktop:col-span-11',
  12: 'desktop:col-span-12',
};

const LG_MAP: Record<Required<GridItemProps>['lg'], string> = {
  0: 'lg:hidden',
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
};

const XL_MAP: Record<Required<GridItemProps>['xl'], string> = {
  0: 'xl:hidden',
  1: 'xl:col-span-1',
  2: 'xl:col-span-2',
  3: 'xl:col-span-3',
  4: 'xl:col-span-4',
  5: 'xl:col-span-5',
  6: 'xl:col-span-6',
  7: 'xl:col-span-7',
  8: 'xl:col-span-8',
  9: 'xl:col-span-9',
  10: 'xl:col-span-10',
  11: 'xl:col-span-11',
  12: 'xl:col-span-12',
};

export type GridProps = PropsWithChildren<GridContainerProps | GridItemProps>;

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
export const Grid = ({ container, children, as: Container = 'div', ...props }: GridProps) =>
  container ? (
    <Container className='grid w-full grid-cols-12 gap-5'>{children}</Container>
  ) : (
    <Container
      className={cn(
        props.mobile ? MOBILE_MAP[props.mobile] : 'col-span-12',
        props.tablet && TABLET_MAP[props.tablet],
        props.desktop && DESKTOP_MAP[props.desktop],
        props.lg && LG_MAP[props.lg],
        props.xl && XL_MAP[props.xl],
      )}
    >
      {children}
    </Container>
  );
