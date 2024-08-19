import { css, DefaultTheme } from 'styled-components';

/**
 * This file contains styles that are used throughout the Penumbra UI library.
 * Many of them correlate 1-to-1 to specific components (such as `h1`, `large`,
 * etc.), while others are base styles shared by a number of components.
 */

const base = css<{
  $color?: (color: DefaultTheme['color']) => string;
}>`
  margin: 0;
  color: ${props =>
    props.$color ? props.$color(props.theme.color) : props.theme.color.text.primary};
`;

export const h1 = css`
  ${base}

  font-family: ${props => props.theme.font.heading};
  font-size: ${props => props.theme.fontSize.text6xl};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.text6xl};
`;

export const h2 = css`
  ${base}

  font-family: ${props => props.theme.font.heading};
  font-size: ${props => props.theme.fontSize.text5xl};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.text5xl};
`;

export const h3 = css`
  ${base}

  font-family: ${props => props.theme.font.heading};
  font-size: ${props => props.theme.fontSize.text4xl};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.text4xl};
`;

export const h4 = css`
  ${base}

  font-family: ${props => props.theme.font.heading};
  font-size: ${props => props.theme.fontSize.text3xl};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.text3xl};
`;

export const large = css`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textLg};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.textLg};
`;

export const body = css`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textBase};
  font-weight: 400;
  line-height: ${props => props.theme.lineHeight.textBase};
`;

export const strong = css`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textBase};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.textBase};
`;

export const detail = css`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textXs};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.textXs};
`;

export const detailTechnical = css`
  ${base}

  font-family: ${props => props.theme.font.mono};
  font-size: ${props => props.theme.fontSize.textXs};
  font-weight: 400;
  line-height: ${props => props.theme.lineHeight.textXs};
`;

export const small = css`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textSm};
  font-weight: 400;
  line-height: ${props => props.theme.lineHeight.textSm};
`;

export const tab = css`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textLg};
  font-weight: 400;
  line-height: ${props => props.theme.lineHeight.textLg};
`;

export const tableItem = css`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textBase};
  font-weight: 400;
  line-height: ${props => props.theme.lineHeight.textBase};
`;

export const tableHeading = css`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textBase};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.textBase};
`;

export const technical = css`
  ${base}

  font-family: ${props => props.theme.font.mono};
  font-size: ${props => props.theme.fontSize.textSm};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.textSm};
`;

export const xxl = css`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.text2xl};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.text2xl};
`;

export const button = css`
  ${base}

  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textBase};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.textBase};
`;

export const truncate = `
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
