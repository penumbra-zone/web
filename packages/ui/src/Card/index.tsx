import { ReactNode } from 'react';
import styled, { WebTarget } from 'styled-components';
import { hexOpacity } from '../utils/hexOpacity';
import { motion } from 'framer-motion';
import { Title } from './Title';

const Root = styled.section``;

const Content = styled(motion.div)`
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

  /**
   * This will be passed on to the Framer `motion.div` wrapping the card's
   * content underneath the title.
   *
   * @see https://www.framer.com/motion/component/##layout-animation
   */
  layout?: boolean | 'position' | 'size' | 'preserve-aspect';
  /**
   * This will be passed on to the Framer `motion.div` wrapping the card's
   * content underneath the title.
   *
   * @see https://www.framer.com/motion/component/##layout-animation
   */
  layoutId?: string;
}

/**
 * `<Card />`s are rectangular sections of a page set off from the rest of the
 * page by a background and an optional title. They're useful for presenting
 * data, or for wrapping a form.
 *
 * A `<Card />` wraps its children in a flex column with a spacing of `4`
 * between each top-level HTML element. This results in a standard card layout
 * no matter what its contents are.
 *
 * If you wish to pass children to `<Card />` that should not be spaced apart in
 * that way, simply pass a single HTML element as the root of the `<Card />`'s
 * children. That way, the built-in flex column will have no effect:
 *
 * ```tsx
 * <Card title="This is the card title">
 *   <div>
 *     <span>These two elements...</span>
 *     <span>...will not appear in a flex column, but rather inline beside each
 *     other.</span>
 *   </div>
 * </Card>
 * ```
 *
 * You can also use `<Card.Stack />` and `<Card.Section />` to create a stack of
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
export const Card = ({ children, as = 'section', title, layout, layoutId }: CardProps) => {
  return (
    <Root as={as}>
      {title && <Title>{title}</Title>}

      <Content layout={layout} layoutId={layoutId}>
        {children}
      </Content>
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
