import { ReactNode } from 'react';
import styled, { WebTarget } from 'styled-components';
import { large } from '../utils/typography';
import { hexOpacity } from '../utils/hexOpacity';

const Root = styled.section``;

const Title = styled.h2`
  ${large};

  color: ${props => props.theme.color.base.white};
  padding: ${props => props.theme.spacing(3)};
`;

const Content = styled.div`
  background: linear-gradient(
    136deg,
    ${props => props.theme.color.neutral.contrast + hexOpacity(0.1)} 6.32%,
    ${props => props.theme.color.neutral.contrast + hexOpacity(0.01)} 75.55%
  );
  backdrop-filter: blur(${props => props.theme.blur.lg});
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing(3)};

  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(4)};
`;

export interface CardProps {
  children?: ReactNode;
  /**
   * Which component or HTML element to render this card as.
   *
   * @example
   * ```tsx
   * <Card as='main'>This is a main element with card styling</Card>
   * ```
   */
  as?: WebTarget;
  title?: ReactNode;
}

/**
 * `<Card />`s are rectangular sections of a page set off from the rest of the
 * page by a background and an optional title. They're useful for presenting
 * data, or for wrapping a form.
 *
 * You can use `<Card.Stack />` and `<Card.Section />` to create a stack of
 * sections, which are useful for wrapping individual form fields.
 *
 * ```tsx
 * <Card title="This is the card title">
 *   <Card.Stack>
 *     <Card.Section><Text>Section one</Text></Card.Section>
 *     <Card.Section><Text>Section two</Text></Card.Section>
 *   </Card.Stack>
 * </Card>
 * ```
 */
export const Card = ({ children, as = 'section', title }: CardProps) => {
  return (
    <Root as={as}>
      {title && <Title>{title}</Title>}

      <Content>{children}</Content>
    </Root>
  );
};

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(1)};

  border-radius: ${props => props.theme.borderRadius.sm};
  overflow: hidden; /** To enforce the border-radius */
`;
const Stack = ({ children }: { children?: ReactNode }) => {
  return <StyledStack>{children}</StyledStack>;
};
Card.Stack = Stack;

const StyledSection = styled.div`
  background-color: ${props => props.theme.color.other.tonalFill5};
  padding: ${props => props.theme.spacing(3)};
`;
const Section = ({ children }: { children?: ReactNode }) => (
  <StyledSection>{children}</StyledSection>
);
Card.Section = Section;
