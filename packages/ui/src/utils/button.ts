import { css, DefaultTheme } from 'styled-components';

export type ActionType = 'default' | 'accent' | 'unshield' | 'destructive';

export type Variant = 'primary' | 'secondary';

export type Size = 'dense' | 'sparse';

const focusOutline = css<{
  $getFocusOutlineColor: (theme: DefaultTheme) => string;
  $getBorderRadius: (theme: DefaultTheme) => string;
}>`
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;

    outline-width: 2px;
    outline-style: solid;
    outline-color: transparent;
    border-radius: ${props => props.$getBorderRadius(props.theme)};

    transition: outline-color 0.15s;
  }

  /**
   * The focus outline is styled on the \`::after\` pseudo-element, rather than
   * just adding an \`outline\`. This is because, if we only used \`outline\`,
   * and the currently focused button is right before a disabled button, the
   * overlay of the disabled button would be above the outline, making the
   * outline appear to be partly cut off.
   */
  &:focus::after {
    outline-color: ${props => props.$getFocusOutlineColor(props.theme)};
  }

  &:disabled::after {
    pointer-events: none;
  }
`;

const overlays = css<{
  $getBorderRadius: (theme: DefaultTheme) => string;
}>`
  &::before {
    border-radius: ${props => props.$getBorderRadius(props.theme)};
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;

    transition: background-color 0.15s;
  }

  &:hover::before {
    background-color: ${props => props.theme.color.action.hoverOverlay};
  }

  &:active::before {
    background-color: ${props => props.theme.color.action.activeOverlay};
  }

  &:disabled::before {
    background-color: ${props => props.theme.color.action.disabledOverlay};
    cursor: not-allowed;
  }
`;

/**
 * A set of shared styles for buttons that handle `:hover`, `:active`,
 * `:disabled`, etc. states.
 *
 * Requires a few props to get rendering parameters, which means that any styled
 * components that use this utility will need to have those props defined as
 * well.
 */
export const buttonInteractions = css<{
  $getFocusOutlineColor: (theme: DefaultTheme) => string;
  $getBorderRadius: (theme: DefaultTheme) => string;
}>`
  ${overlays}
  ${focusOutline}
`;
