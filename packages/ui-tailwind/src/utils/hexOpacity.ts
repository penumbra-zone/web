/**
 * Given a decimal opacity (between 0 and 1), returns a two-character string
 * that can be appended to an RGB value for the alpha channel.
 *
 * ```ts
 * `#000000${opacityInHex(0.5)}` // #00000080 -- i.e., black at 50% opacity
 * ```
 */
export const hexOpacity = (opacity: number) =>
  Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
