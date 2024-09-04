import styled, { DefaultTheme } from 'styled-components';
import { asTransientProps } from '../utils/asTransientProps';
import { ReactNode } from 'react';
import { body, technical, detail, detailTechnical } from '../utils/typography';
import { Density } from '../types/Density';
import { useDensity } from '../hooks/useDensity';

type Priority = 'primary' | 'secondary';
type Context =
  | 'default'
  | 'technical-default'
  | 'technical-success'
  | 'technical-caution'
  | 'technical-destructive';

const getFont = (context: Context, density: Density) => {
  if (context === 'default') {
    return density === 'sparse' ? body : detail;
  }
  return density === 'sparse' ? technical : detailTechnical;
};

const getXPadding = (priority: Priority, density: Density) => {
  let padding = density === 'sparse' ? 3 : 2;
  if (priority === 'secondary') {
    padding = padding - 0.5;
  }
  return padding;
};

const getBackgroundColor = (theme: DefaultTheme, priority: Priority, context: Context) => {
  if (priority === 'secondary') {
    return 'transparent';
  }
  const colorMap: Record<Context, string> = {
    default: theme.color.other.tonalFill10,
    'technical-default': theme.color.other.tonalFill10,
    'technical-success': theme.color.secondary.light,
    'technical-caution': theme.color.caution.light,
    'technical-destructive': theme.color.destructive.light,
  };
  return colorMap[context];
};

const getColor = (theme: DefaultTheme, priority: Priority, context: Context) => {
  if (priority === 'primary') {
    return context === 'default' || context === 'technical-default'
      ? theme.color.text.primary
      : theme.color.secondary.dark;
  }

  const colorMap: Record<Context, string> = {
    default: theme.color.text.primary,
    'technical-default': theme.color.text.primary,
    'technical-success': theme.color.secondary.light,
    'technical-caution': theme.color.caution.light,
    'technical-destructive': theme.color.destructive.light,
  };
  return colorMap[context];
};

const Root = styled.span<{ $density: Density; $priority: Priority; $context: Context }>`
  box-sizing: border-box;

  border: ${props =>
    props.$priority === 'secondary' ? `2px dashed ${props.theme.color.other.tonalStroke}` : 'none'};
  border-radius: ${props => props.theme.borderRadius.full};

  display: inline-block;
  max-width: 100%;
  width: max-content;

  padding-top: ${props => props.theme.spacing(props.$priority === 'secondary' ? 0.5 : 1)};
  padding-bottom: ${props => props.theme.spacing(props.$priority === 'secondary' ? 0.5 : 1)};

  padding-left: ${props => props.theme.spacing(getXPadding(props.$priority, props.$density))};
  padding-right: ${props => props.theme.spacing(getXPadding(props.$priority, props.$density))};

  ${props => getFont(props.$context, props.$density)};
  color: ${props => getColor(props.theme, props.$priority, props.$context)};
  background-color: ${props => getBackgroundColor(props.theme, props.$priority, props.$context)};
`;

export interface PillProps {
  children: ReactNode;
  priority?: Priority;
  context?: Context;
}

export const Pill = ({ children, priority = 'primary', context = 'default' }: PillProps) => {
  const density = useDensity();

  return <Root {...asTransientProps({ density, priority, context })}>{children}</Root>;
};
