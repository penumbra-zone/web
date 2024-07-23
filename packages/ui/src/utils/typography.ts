import { css } from 'styled-components';

/**
 * This file contains styles that are used throughout the Penumbra UI library.
 * Many of them correlate 1-to-1 to specific components (such as `h1`, `large`,
 * etc.), while others are base styles shared by a number of components.
 */

const base = `
  margin: 0;
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

export const button = css`
  font-family: ${props => props.theme.font.default};
  font-size: ${props => props.theme.fontSize.textBase};
  font-weight: 500;
  line-height: ${props => props.theme.lineHeight.textBase};
`;
