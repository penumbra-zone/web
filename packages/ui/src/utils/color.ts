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
  'base.blackAlt': ['text-base-black-alt', 'bg-base-black-alt'],
  'base.white': ['text-base-white', 'bg-base-white'],
  'base.transparent': ['text-base-transparent', 'bg-base-transparent'],
  'text.primary': ['text-text-primary', 'bg-text-primary'],
  'text.secondary': ['text-text-secondary', 'bg-text-secondary'],
  'text.muted': ['text-text-muted', 'bg-text-muted'],
  'text.special': ['text-text-special', 'bg-text-special'],
  'action.hoverOverlay': ['text-action-hover-overlay', 'bg-action-hover-overlay'],
  'action.activeOverlay': ['text-action-active-overlay', 'bg-action-active-overlay'],
  'action.disabledOverlay': ['text-action-disabled-overlay', 'bg-action-disabled-overlay'],
  'action.primaryFocusOutline': [
    'text-action-primary-focus-outline',
    'bg-action-primary-focus-outline',
  ],
  'action.secondaryFocusOutline': [
    'text-action-secondary-focus-outline',
    'bg-action-secondary-focus-outline',
  ],
  'action.unshieldFocusOutline': [
    'text-action-unshield-focus-outline',
    'bg-action-unshield-focus-outline',
  ],
  'action.neutralFocusOutline': [
    'text-action-neutral-focus-outline',
    'bg-action-neutral-focus-outline',
  ],
  'action.destructiveFocusOutline': [
    'text-action-destructive-focus-outline',
    'bg-action-destructive-focus-outline',
  ],
  'action.successFocusOutline': [
    'text-action-success-focus-outline',
    'bg-action-success-focus-outline',
  ],
  'other.tonalStroke': ['text-other-tonal-stroke', 'bg-other-tonal-stroke'],
  'other.tonalFill5': ['text-other-tonal-fill5', 'bg-other-tonal-fill5'],
  'other.tonalFill10': ['text-other-tonal-fill10', 'bg-other-tonal-fill10'],
  'other.solidStroke': ['text-other-solid-stroke', 'bg-other-solid-stroke'],
  'other.dialogBackground': ['text-other-dialog-background', 'bg-other-dialog-background'],
  'other.overlay': ['text-other-overlay', 'bg-other-overlay'],
  'other.neutralOutline': ['text-other-neutral-outline', 'bg-other-neutral-outline'],
  'other.orangeOutline': ['text-other-orange-outline', 'bg-other-orange-outline'],
};

/**
 * Takes a color string in the format of `primary.light` and
 * returns the tailwind classes for text and background.
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
