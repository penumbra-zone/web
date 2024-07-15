import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './Grid';
import { Technical } from './Typography';
import styled from 'styled-components';
import {
  type ColorVariants,
  type Color as TColor,
  type TextColorVariants,
} from './ThemeProvider/theme';
import { Fragment } from 'react';
import { media } from './utils/media';

const meta: Meta = {};
export default meta;

const Label = styled.div`
  display: flex;
  height: 100%;

  ${media.tablet`
    align-items: center;
  `}
`;

const Variants = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing(4)};
  grid-template-columns: 1fr;

  ${media.tablet`
    grid-template-columns: repeat(4, 1fr);
  `}
`;

type VariantProps =
  | {
      $color: 'text';
      $colorVariant: TextColorVariants;
    }
  | {
      $color: Exclude<TColor, 'text'>;
      $colorVariant: ColorVariants;
    };

const Variant = styled.div<VariantProps>`
  background-color: ${props =>
    props.$color === 'text'
      ? 'transparent'
      : props.theme.colors[props.$color][props.$colorVariant]};
  border-radius: ${props => props.theme.borderRadius.xl};
  color: ${props =>
    props.$color === 'text'
      ? props.theme.colors.text[props.$colorVariant]
      : props.$colorVariant === 'contrast' || props.$colorVariant === 'light'
        ? props.theme.colors[props.$color].dark
        : props.theme.colors.text.primary};
  padding: ${props => props.theme.spacing(2)};
`;

const BASE_COLORS: Exclude<TColor, 'text'>[] = [
  'neutral',
  'primary',
  'secondary',
  'unshield',
  'destructive',
  'caution',
  'success',
];

const Color = <T extends TColor>({ color }: { color: T }) => (
  <Fragment key={color}>
    <Grid mobile={6} tablet={2}>
      <Label>
        <Technical>{color}</Technical>
      </Label>
    </Grid>
    <Grid mobile={6} tablet={10}>
      <Variants>
        {color === 'text'
          ? (['primary', 'secondary', 'disabled', 'special'] as const).map(variant => (
              <Variant key={variant} $color={color} $colorVariant={variant}>
                <Technical>{variant}</Technical>
              </Variant>
            ))
          : (['main', 'light', 'dark', 'contrast'] as const).map(variant => (
              <Variant key={variant} $color={color} $colorVariant={variant}>
                <Technical>{variant}</Technical>
              </Variant>
            ))}
      </Variants>
    </Grid>
  </Fragment>
);

export const ColorGrid: StoryObj = {
  tags: ['!dev'],
  render: function Render() {
    return (
      <>
        <Grid container as='section'>
          <Color color='text' />

          {BASE_COLORS.map(color => (
            <Color key={color} color={color} />
          ))}
        </Grid>
      </>
    );
  },
};
