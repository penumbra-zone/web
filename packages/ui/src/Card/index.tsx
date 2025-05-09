import { ReactNode, ElementType } from 'react';
import cn from 'clsx';
import { large } from '../utils/typography';

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
  as?: ElementType;
  title?: ReactNode;
  /**
   * Additional action element to display in the header next to the title
   */
  headerAction?: ReactNode;
  /**
   * Content to display at the end of the title row
   * This will be positioned on the right side of the title
   */
  endContent?: ReactNode;
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
export const Card = ({ children, as: Wrapper = 'section', title, headerAction, endContent }: CardProps) => {
  return (
    <Wrapper>
      {(title || headerAction || endContent) && (
        <div className={cn('flex justify-between items-center p-3')}>
          <div className="flex items-center gap-2 justify-between flex-1">
            {title && <h2 className={cn(large, 'text-base-white')}>{title}</h2>}
            {endContent && <div>{endContent}</div>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className='flex flex-col gap-4 rounded-xl bg-cardGradient p-3 backdrop-blur-lg'>{children}</div>
    </Wrapper>
  );
};

const Stack = ({ children }: { children?: ReactNode }) => {
  return <div className='flex flex-col gap-1 overflow-hidden rounded-sm'>{children}</div>;
};
Card.Stack = Stack;

const Section = ({ children }: { children?: ReactNode }) => (
  <div className='bg-other-tonalFill5 p-3'>{children}</div>
);
Card.Section = Section;
