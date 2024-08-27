import { css, DefaultTheme } from 'styled-components';

export type Priority = 'primary' | 'secondary';

/** Shared styles to use for any `<button />` */
export const buttonBase = css`
  appearance: none;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
`;

/** Adds a focus outline to a button using the `:focus-within` pseudoclass. */
export const focusOutline = css<{
  $getFocusOutlineColor: (theme: DefaultTheme) => string;
  $getFocusOutlineOffset?: (theme: DefaultTheme) => string | undefined;
  $getBorderRadius: (theme: DefaultTheme) => string;
}>`
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;

    outline-width: 2px;
    outline-style: solid;
    outline-color: transparent;
    ${props =>
      props.$getFocusOutlineOffset?.(props.theme) &&
      `outline-offset: ${props.$getFocusOutlineOffset(props.theme)};`}
    border-radius: ${props => props.$getBorderRadius(props.theme)};

    transition: outline-color 0.15s;
  }

  /**
   * The focus outline is styled on the \`::after\` pseudo-element, rather than
   * just adding an \`outline\` to the base element. This is because, if we only
   * used \`outline\`, and the currently focused button is right before a
   * disabled button, the overlay of the disabled button would be above the
   * outline, making the outline appear to be partly cut off.
   */
  &:focus-within {
    outline: none;
  }

  &:focus-within::after {
    outline-color: ${props => props.$getFocusOutlineColor(props.theme)};
  }

  &:disabled,
  &:disabled::after {
    pointer-events: none;
  }
`;

/** Adds overlays to a button for when it's hovered, active, or disabled. */
export const overlays = css<{
  $getBorderRadius: (theme: DefaultTheme) => string;
  $getFocusOutlineColor: (theme: DefaultTheme) => string;
}>`
  position: relative;

  &::before {
    border-radius: ${props => props.$getBorderRadius(props.theme)};
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;

    transition: background-color 0.15s, outline 0.15s;
  }

  @media (hover: hover) {
    &:hover::before {
      background-color: ${props => props.theme.color.action.hoverOverlay};
    }
  }

  &:active::before {
    background-color: ${props => props.theme.color.action.activeOverlay};
  }
  
  &:focus::before {
    outline: 2px solid ${props => props.$getFocusOutlineColor(props.theme)};
  }

  &:disabled::before {
    background-color: ${props => props.theme.color.action.disabledOverlay};
    cursor: not-allowed;
  }
`;
