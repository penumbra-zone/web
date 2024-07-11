import { css, DefaultTheme, RuleSet } from 'styled-components';

const breakpoints: (keyof DefaultTheme['breakpoints'])[] = [
  'mobile',
  'tablet',
  'desktop',
  'lg',
  'xl',
];

type Media = Record<
  keyof DefaultTheme['breakpoints'],
  (...args: Parameters<typeof css>) => RuleSet
>;

/**
 * CSS mixin for adding a min-width media query.
 *
 * @example
 * ```tsx
 * const Div = styled.div`
 *   ${media.mobile`
 *     width: 100%;
 *   `}
 *
 *   ${media.tablet`
 *     width: 50%;
 *   `}
 * `
 * ```
 *
 * @see https://www.codevertiser.com/styled-components-media-queries/
 * @internal
 */
export const media = breakpoints.reduce<Partial<Media>>(
  (prev, breakpoint) => ({
    ...prev,
    [breakpoint]: (...args: Parameters<typeof css>) => css`
      @media (min-width: ${props => props.theme.breakpoints[breakpoint]}px) {
        ${css(...args)};
      }
    `,
  }),
  {},
) as unknown as Media;
