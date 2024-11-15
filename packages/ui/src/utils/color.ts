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

/** Helper function to generate class names based on a consistent pattern. */
const generateClassNames = (base: string): [string, string, string] => {
  return [`text-${base}`, `bg-${base}`, `outline-${base}`];
};

/** This mapper class is needed to help Tailwind statically analyze the classes that could
 * be produced from the `getThemeColorClass` function. */
export const COLOR_CLASS_MAP: Record<ThemeColor, [string, string, string]> = {
  'neutral.main': generateClassNames('neutral-main'),
  'neutral.light': generateClassNames('neutral-light'),
  'neutral.dark': generateClassNames('neutral-dark'),
  'neutral.contrast': generateClassNames('neutral-contrast'),
  'primary.main': generateClassNames('primary-main'),
  'primary.light': generateClassNames('primary-light'),
  'primary.dark': generateClassNames('primary-dark'),
  'primary.contrast': generateClassNames('primary-contrast'),
  'secondary.main': generateClassNames('secondary-main'),
  'secondary.light': generateClassNames('secondary-light'),
  'secondary.dark': generateClassNames('secondary-dark'),
  'secondary.contrast': generateClassNames('secondary-contrast'),
  'unshield.main': generateClassNames('unshield-main'),
  'unshield.light': generateClassNames('unshield-light'),
  'unshield.dark': generateClassNames('unshield-dark'),
  'unshield.contrast': generateClassNames('unshield-contrast'),
  'destructive.main': generateClassNames('destructive-main'),
  'destructive.light': generateClassNames('destructive-light'),
  'destructive.dark': generateClassNames('destructive-dark'),
  'destructive.contrast': generateClassNames('destructive-contrast'),
  'caution.main': generateClassNames('caution-main'),
  'caution.light': generateClassNames('caution-light'),
  'caution.dark': generateClassNames('caution-dark'),
  'caution.contrast': generateClassNames('caution-contrast'),
  'success.main': generateClassNames('success-main'),
  'success.light': generateClassNames('success-light'),
  'success.dark': generateClassNames('success-dark'),
  'success.contrast': generateClassNames('success-contrast'),
  'base.black': generateClassNames('base-black'),
  'base.white': generateClassNames('base-white'),
  'base.transparent': generateClassNames('base-transparent'),
  'text.primary': generateClassNames('text-primary'),
  'text.secondary': generateClassNames('text-secondary'),
  'text.muted': generateClassNames('text-muted'),
  'text.special': generateClassNames('text-special'),
  'action.hoverOverlay': generateClassNames('action-hoverOverlay'),
  'action.activeOverlay': generateClassNames('action-activeOverlay'),
  'action.disabledOverlay': generateClassNames('action-disabledOverlay'),
  'action.primaryFocusOutline': generateClassNames('action-primaryFocusOutline'),
  'action.secondaryFocusOutline': generateClassNames('action-secondaryFocusOutline'),
  'action.unshieldFocusOutline': generateClassNames('action-unshieldFocusOutline'),
  'action.neutralFocusOutline': generateClassNames('action-neutralFocusOutline'),
  'action.destructiveFocusOutline': generateClassNames('action-destructiveFocusOutline'),
  'other.tonalStroke': generateClassNames('other-tonalStroke'),
  'other.tonalFill5': generateClassNames('other-tonalFill5'),
  'other.tonalFill10': generateClassNames('other-tonalFill10'),
  'other.solidStroke': generateClassNames('other-solidStroke'),
  'other.dialogBackground': generateClassNames('other-dialogBackground'),
  'other.overlay': generateClassNames('other-overlay'),
};

/**
 * Takes a color string in the format of `primary.light` and
 * returns the tailwind classes for text, background, and outline.
 */
export const getThemeColorClass = (color: ThemeColor) => {
  const mapped = COLOR_CLASS_MAP[color] as [string, string, string] | undefined;
  if (!mapped) {
    throw new Error(`Color "${color}" does not exist`);
  }

  return {
    text: mapped[0],
    bg: mapped[1],
    outline: mapped[2],
  };
};
