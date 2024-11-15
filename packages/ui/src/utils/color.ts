import { theme } from '../theme/theme';

export type Colors = (typeof theme)['color'];

/**
 * This types gets a two-level-nested object of colors `e.g. { primary: { light: '#fff' } }`
 * and transforms it to the union type of object keys with dot notation like `primary.light`.
 */
type MapColorsToDotNotation<Obj extends Record<string, Record<string, string>>> = {
  [K1 in keyof Obj]: `${K1 & string}.${keyof Obj[K1] & string}`;
}[keyof Obj];

/**
 * A union type of all theme colors. It is supposed to simplify passing color props to components
 * without letting users provide generic classes.
 */
export type ThemeColor = MapColorsToDotNotation<Colors>;

/**
 * Takes a color string in the format of `primary.light` and returns the color value from the theme.
 */
export const getThemeColor = (color: ThemeColor): string => {
  const colors = theme.color;

  try {
    const [group, shade] = color.split('.') as ['primary', keyof Colors['primary']];
    return colors[group][shade];
  } catch (_) {
    throw new Error(`Color "${color}" not found in the registered Tailwind theme`);
  }
};

/** This mapper class is needed to help Tailwind statically analyze the classes that could
 * be produced from the `getThemeColorClass` function. */
export const COLOR_CLASS_MAP: Record<ThemeColor, [string, string]> = {
  'neutral.main': ['text-neutral-main', 'bg-neutral-main'],
  'neutral.light': ['text-neutral-light', 'bg-neutral-light'],
  'neutral.dark': ['text-neutral-dark', 'bg-neutral-dark'],
  'neutral.contrast': ['text-neutral-contrast', 'bg-neutral-contrast'],
  'primary.main': ['text-primary-main', 'bg-primary-main'],
  'primary.light': ['text-primary-light', 'bg-primary-light'],
  'primary.dark': ['text-primary-dark', 'bg-primary-dark'],
  'primary.contrast': ['text-primary-contrast', 'bg-primary-contrast'],
  'secondary.main': ['text-secondary-main', 'bg-secondary-main'],
  'secondary.light': ['text-secondary-light', 'bg-secondary-light'],
  'secondary.dark': ['text-secondary-dark', 'bg-secondary-dark'],
  'secondary.contrast': ['text-secondary-contrast', 'bg-secondary-contrast'],
  'unshield.main': ['text-unshield-main', 'bg-unshield-main'],
  'unshield.light': ['text-unshield-light', 'bg-unshield-light'],
  'unshield.dark': ['text-unshield-dark', 'bg-unshield-dark'],
  'unshield.contrast': ['text-unshield-contrast', 'bg-unshield-contrast'],
  'destructive.main': ['text-destructive-main', 'bg-destructive-main'],
  'destructive.light': ['text-destructive-light', 'bg-destructive-light'],
  'destructive.dark': ['text-destructive-dark', 'bg-destructive-dark'],
  'destructive.contrast': ['text-destructive-contrast', 'bg-destructive-contrast'],
  'caution.main': ['text-caution-main', 'bg-caution-main'],
  'caution.light': ['text-caution-light', 'bg-caution-light'],
  'caution.dark': ['text-caution-dark', 'bg-caution-dark'],
  'caution.contrast': ['text-caution-contrast', 'bg-caution-contrast'],
  'success.main': ['text-success-main', 'bg-success-main'],
  'success.light': ['text-success-light', 'bg-success-light'],
  'success.dark': ['text-success-dark', 'bg-success-dark'],
  'success.contrast': ['text-success-contrast', 'bg-success-contrast'],
  'base.black': ['text-base-black', 'bg-base-black'],
  'base.white': ['text-base-white', 'bg-base-white'],
  'base.transparent': ['text-base-transparent', 'bg-base-transparent'],
  'text.primary': ['text-text-primary', 'bg-text-primary'],
  'text.secondary': ['text-text-secondary', 'bg-text-secondary'],
  'text.muted': ['text-text-muted', 'bg-text-muted'],
  'text.special': ['text-text-special', 'bg-text-special'],
  'action.hoverOverlay': ['text-action-hoverOverlay', 'bg-action-hoverOverlay'],
  'action.activeOverlay': ['text-action-activeOverlay', 'bg-action-activeOverlay'],
  'action.disabledOverlay': ['text-action-disabledOverlay', 'bg-action-disabledOverlay'],
  'action.primaryFocusOutline': [
    'text-action-primaryFocusOutline',
    'bg-action-primaryFocusOutline',
  ],
  'action.secondaryFocusOutline': [
    'text-action-secondaryFocusOutline',
    'bg-action-secondaryFocusOutline',
  ],
  'action.unshieldFocusOutline': [
    'text-action-unshieldFocusOutline',
    'bg-action-unshieldFocusOutline',
  ],
  'action.neutralFocusOutline': [
    'text-action-neutralFocusOutline',
    'bg-action-neutralFocusOutline',
  ],
  'action.destructiveFocusOutline': [
    'text-action-destructiveFocusOutline',
    'bg-action-destructiveFocusOutline',
  ],
  'other.tonalStroke': ['text-other-tonalStroke', 'bg-other-tonalStroke'],
  'other.tonalFill5': ['text-other-tonalFill5', 'bg-other-tonalFill5'],
  'other.tonalFill10': ['text-other-tonalFill10', 'bg-other-tonalFill10'],
  'other.solidStroke': ['text-other-solidStroke', 'bg-other-solidStroke'],
  'other.dialogBackground': ['text-other-dialogBackground', 'bg-other-dialogBackground'],
  'other.overlay': ['text-other-overlay', 'bg-other-overlay'],
};

/**
 * Takes a color string in the format of `primary.light` and
 * returns the tailwind classes for text, background, and outline.
 */
export const getThemeColorClass = (color: ThemeColor) => {
  const mapped = COLOR_CLASS_MAP[color] as [string, string] | undefined;
  if (!mapped) {
    throw new Error(`Color "${color}" does not exist`);
  }

  return {
    text: mapped[0],
    bg: mapped[1],
  };
};
