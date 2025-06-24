import cn from 'clsx';
import { getThemeColorClass, ThemeColor } from './color';

/**
 * This file contains styles that are used throughout the Penumbra UI library.
 * Many of them correlate 1-to-1 to specific components (such as `h1`, `large`,
 * etc.), while others are base styles shared by a number of components.
 */

export const getTextBase = (color?: ThemeColor) =>
  cn('m-0 transition-colors duration-150', color ? getThemeColorClass(color).text : '');

export const h1 = cn('font-heading text-text6xl leading-text6xl font-medium');

export const h2 = cn('font-heading text-text5xl leading-text5xl font-medium');

export const h3 = cn('font-heading text-text4xl leading-text4xl font-medium');

export const h4 = cn('font-heading text-text3xl leading-text3xl font-medium');

export const xxl = cn('font-default text-text2xl leading-text2xl font-medium');

export const large = cn('font-default text-text-lg leading-text-lg font-medium');

export const body = cn('font-default text-text-base leading-text-base font-normal');

export const bodyStrong = cn('font-default text-text-base leading-text-base font-medium');

export const bodyTechnical = cn('font-mono text-text-base leading-text-base font-normal');

export const small = cn('font-default text-text-sm leading-text-xs font-normal');

export const smallTechnical = cn('font-mono text-text-sm leading-text-sm font-normal');

export const xs = cn('font-default text-text-xs leading-text-xs font-normal');

export const detail = cn('font-default text-text-xs leading-text-xs font-normal');

export const detailTechnical = cn('font-mono text-text-xs leading-text-xs font-normal');

export const xxs = cn('font-default text-text-xxs leading-text-xxs font-normal');

export const tab = cn('font-default text-text-lg leading-text-lg font-normal');

export const tabSmall = cn('font-default text-text-sm leading-text-sm font-medium');

export const tabMedium = cn('font-default text-text-sm leading-text-lg font-medium');

export const tableItem = cn('font-default text-text-base leading-text-base font-normal');

export const tableItemMedium = cn('font-default text-text-sm leading-text-sm font-normal');

export const tableItemSmall = cn('font-default text-text-xs leading-text-xs font-normal');

export const tableHeading = cn('font-default text-text-base leading-text-base font-medium');

export const tableHeadingMedium = cn('font-default text-text-sm leading-text-sm font-medium');

export const tableHeadingSmall = cn('font-default text-text-xs leading-text-xs font-medium');

export const technical = cn('font-mono text-text-base leading-text-base font-medium');

// equals to body with the bottom margin
export const p = cn('mb-6 font-default text-text-base leading-text-base font-normal last:mb-0');

export const button = cn('font-default text-text-base leading-text-base font-medium');

export const buttonMedium = cn('font-default text-text-sm leading-text-base font-medium');

export const buttonSmall = cn('font-default text-text-xs leading-text-base font-medium');
