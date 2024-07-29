import styled from 'styled-components';
import { asTransientProps } from '../utils/asTransientProps';
import { ReactNode } from 'react';
import { button } from '../utils/typography';
import { Density } from '../types/Density';
import { useDensity } from '../hooks/useDensity';

type Priority = 'primary' | 'secondary';

const TEN_PERCENT_OPACITY_IN_HEX = '1a';

const Root = styled.span<{ $density: Density; $priority: Priority }>`
  ${button}

  box-sizing: border-box;
  border: 2px dashed
    ${props =>
      props.$priority === 'secondary' ? props.theme.color.other.tonalStroke : 'transparent'};
  border-radius: ${props => props.theme.borderRadius.full};

  display: inline-block;
  max-width: 100%;

  padding-top: ${props => props.theme.spacing(props.$density === 'sparse' ? 2 : 1)};
  padding-bottom: ${props => props.theme.spacing(props.$density === 'sparse' ? 2 : 1)};

  padding-left: ${props => props.theme.spacing(props.$density === 'sparse' ? 4 : 2)};
  padding-right: ${props => props.theme.spacing(props.$density === 'sparse' ? 4 : 2)};

  background-color: ${props =>
    props.$priority === 'primary'
      ? props.theme.color.text.primary + TEN_PERCENT_OPACITY_IN_HEX
      : 'transparent'};
`;

export interface PillProps {
  children: ReactNode;
  priority?: Priority;
}

export const Pill = ({ children, priority = 'primary' }: PillProps) => {
  const density = useDensity();

  return <Root {...asTransientProps({ density, priority })}>{children}</Root>;
};
