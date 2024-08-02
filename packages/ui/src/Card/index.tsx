import { ReactNode } from 'react';
import styled, { WebTarget } from 'styled-components';
import { large } from '../utils/typography';

const Root = styled.section``;

const Title = styled.h1`
  ${large};

  color: ${props => props.theme.color.base.white};
  padding: ${props => props.theme.spacing(3)};
`;

const Content = styled.div`
  backdrop-filter: blur(${props => props.theme.blur.lg});
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing(3)};
`;

export interface CardProps {
  children?: ReactNode;
  /**
   * Which component or HTML element to render this card as.
   *
   * @example
   * ```tsx
   * <Card as='section'>This is a section element with card styling</Card>
   * ```
   */
  as?: WebTarget;
  title?: string;
}

export const Card = ({ children, as = 'section', title }: CardProps) => {
  return (
    <Root as={as}>
      {title && <Title>{title}</Title>}

      <Content>{children}</Content>
    </Root>
  );
};
