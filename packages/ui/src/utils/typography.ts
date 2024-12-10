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

export const large = cn('font-default text-textLg font-medium leading-textLg');

export const body = cn('font-default text-textBase font-normal leading-textBase');

export const strong = cn('font-default text-textBase font-medium leading-textBase');

export const detail = cn('font-default text-textXs font-medium leading-textXs');

export const detailTechnical = cn('font-mono text-textXs font-normal leading-textXs');

export const small = cn('font-default text-textSm font-normal leading-textXs');

export const xxs = cn('font-default text-textXxs font-normal leading-textXxs');

export const tab = cn('font-default text-textLg font-normal leading-textLg');

export const tabSmall = cn('font-default text-textSm font-medium leading-textSm');

export const tabMedium = cn('font-default text-textSm font-medium leading-textLg');

export const tableItem = cn('font-default text-textBase font-normal leading-textBase');

export const tableHeading = cn('font-default text-textBase font-medium leading-textBase');

export const technical = cn('font-mono text-textBase font-medium leading-textBase');

export const xxl = cn('font-default text-text2xl font-medium leading-text2xl');

// equals to body with the bottom margin
export const p = cn('font-default text-textBase font-normal leading-textBase mb-6 last:mb-0');
