import { styled } from 'styled-components';
import { large } from '../utils/typography';
import { ReactNode } from 'react';
import { CharacterTransition } from '../CharacterTransition';

const H2 = styled.h2`
  ${large};

  color: ${props => props.theme.color.base.white};
  padding: ${props => props.theme.spacing(3)};
`;

export interface TitleProps {
  children: ReactNode;
}

export const Title = ({ children }: TitleProps) => (
  <H2>
    {typeof children === 'string' ? (
      <CharacterTransition>{children}</CharacterTransition>
    ) : (
      children
    )}
  </H2>
);
