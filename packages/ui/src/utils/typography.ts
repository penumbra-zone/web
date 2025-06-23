import cn from 'clsx';
import { getThemeColorClass, ThemeColor } from './color';

/**
 * This file contains styles that are used throughout the Penumbra UI library.
 * Many of them correlate 1-to-1 to specific components (such as `h1`, `large`,
 * etc.), while others are base styles shared by a number of components.
 */

export const getTextBase = (color?: ThemeColor) =>
  cn('m-0 transition-colors duration-150', color ? getThemeColorClass(color).text : '');

export const h1 = cn('font-heading text-text6xl font-medium leading-text6xl');

export const h2 = cn('font-heading text-text5xl font-medium leading-text5xl');

export const h3 = cn('font-heading text-text4xl font-medium leading-text4xl');

export const h4 = cn('font-heading text-text3xl font-medium leading-text3xl');

export const xxl = cn('font-default text-text2xl font-medium leading-text2xl');

export const large = cn('font-default text-text-lg font-medium leading-text-lg');

export const body = cn('font-default text-text-base font-normal leading-text-base');

export const bodyStrong = cn('font-default text-text-base font-medium leading-text-base');

export const bodyTechnical = cn('font-mono text-text-base font-normal leading-text-base');

export const small = cn('font-default text-text-sm font-normal leading-text-xs');

export const smallTechnical = cn('font-mono text-text-sm font-normal leading-text-sm');

export const xs = cn('font-default text-text-xs font-normal leading-text-xs');

export const detail = cn('font-default text-text-xs font-normal leading-text-xs');

export const detailTechnical = cn('font-mono text-text-xs font-normal leading-text-xs');

export const xxs = cn('font-default text-text-xxs font-normal leading-text-xxs');

export const tab = cn('font-default text-text-lg font-normal leading-text-lg');

export const tabSmall = cn('font-default text-text-sm font-medium leading-text-sm');

export const tabMedium = cn('font-default text-text-sm font-medium leading-text-lg');

export const tableItem = cn('font-default text-text-base font-normal leading-text-base');

export const tableItemMedium = cn('font-default text-text-sm font-normal leading-text-sm');

export const tableItemSmall = cn('font-default text-text-xs font-normal leading-text-xs');

export const tableHeading = cn('font-default text-text-base font-medium leading-text-base');

export const tableHeadingMedium = cn('font-default text-text-sm font-medium leading-text-sm');

export const tableHeadingSmall = cn('font-default text-text-xs font-medium leading-text-xs');

export const technical = cn('font-mono text-text-base font-medium leading-text-base');

// equals to body with the bottom margin
export const p = cn('font-default text-text-base font-normal leading-text-base mb-6 last:mb-0');

export const button = cn('font-default text-text-base font-medium leading-text-base');

export const buttonMedium = cn('font-default text-text-sm font-medium leading-text-base');

export const buttonSmall = cn('font-default text-text-xs font-medium leading-text-base');
