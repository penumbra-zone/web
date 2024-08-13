import { motion } from 'framer-motion';
import { Fragment, memo } from 'react';
import styled from 'styled-components';

/**
 * Since we're splitting individual characters and wrapping them in `<span />`s,
 * browsers will wrap text at whichever span happens to be at the end of a line,
 * regardless of whether that span is in the middle of a word or not. So we have
 * to also wrap words in spans with `white-space: nowrap` styling.
 */
const Word = styled.span`
  white-space: nowrap;
`;

/**
 * We need to display character spans as `inline-block`, rather than `inline`,
 * because CSS `transform`s (which Framer motion uses to animate them) don't
 * apply to inline elements.
 */
const Character = styled(motion.span)`
  display: inline-block;
`;

export interface CharacterTransitionProps {
  /**
   * Note that `children` must be a string -- not any other type of React node
   * -- so that it can be split into individual characters.
   */
  children?: string;
}

/**
 * Renders (unstyled) text that animates individual characters from their old
 * positions to their new positions when the text changes.
 *
 * ## Using more than one `<CharacterTransition />` in the same page
 *
 * tl;dr: Wrap your `<CharacterTransition />` instances with framer-motion's
 * `<LayoutGroup />`, and pass it an `id` prop to properly namespace layout IDs.
 *
 * `<CharacterTransition />` uses framer-motion's `layoutId` prop to animate the
 * individual characters. The layout ID for each character is generated based on
 * the character being animated, as well as its count of that character in the
 * overall string. (For example, the second instance in the string of the letter
 * `c` would have a layout ID of `c2`; the fourth instance of the letter `f`
 * would have a layout ID of `f4`.) This ensures that, when the text changes to
 * something different, characters that are shared between the previous and
 * current text can animate into place.
 *
 * Problems can arise if you have more than one instance of
 * `<CharacterTransition />` on a page at a time. You may see letters fly from
 * one part of the screen to another, because their layout IDs are the same.
 * Layout IDs in framer-motion are global by default, so framer-motion doesn't
 * know that a `c2` in a `<CharacterTransition />` in one place shouldn't
 * animate to the `c2` slot in a `<CharacterTransition />` in another place.
 *
 * Fortunately, framer-motion provides for this possibility via its
 * `<LayoutGroup />` component. If you wrap any set of motion elements (like
 * `motion.span`, which the characters in a `<CharacterTransition />` are
 * wrapped in) with a `<LayoutGroup />` with its `id` property set,
 * framer-motion namespaces all `layoutId`s underneath that layout group with
 * the ID of the group. So, whereas the second instance of `c` would normally
 * have a layout ID of `c2`, when it's wrapped in a `<LayoutGroup id="foo" />`,
 * its layout ID will be namespaced under `foo`. Use `<LayoutGroup />` to ensure
 * that each instance of `<CharacterTransition />` "minds its own business" and
 * only animates within itself.
 *
 * "But why not just use `<LayoutGroup />` internally inside
 * `<CharacterTransition />` so that consumers don't have to worry about it?"
 * Great question. The goal is to allow consumers of `<CharacterTransition />`
 * to use it in as custom of a way as possible. It may be that you won't be
 * changing its `children` prop, but rather will be unmounting it entirely and
 * remounting it as a child of a totally different component, but you still want
 * the letters to animate to their new positions. If we gave every
 * `<CharacterTransition />` its own layout ID namespace, two instances of it
 * that _should_ transition between each other wouldn't be able to. Thus, we
 * leave it up to the consumer to determine how to properly namespace its layout
 * IDs.
 */
export const CharacterTransition = memo(({ children }: CharacterTransitionProps) => {
  if (!children) {
    return null;
  }

  const charCounts: Record<string, number> = {};

  return (
    /**
     * Wrap the entire thing in a `<span />`, so that it is rendered as a single
     * string of text. (Otherwise, a sentence in a flexbox column would have one
     * word rendered per row.)
     */
    <span>
      {children.split(' ').map((word, index, array) => (
        <Fragment key={index}>
          <Word>
            {word.split('').map(char => {
              charCounts[char] = charCounts[char] ? charCounts[char] + 1 : 1;
              const identifier = `${char}${charCounts[char]}`;

              return (
                <Character key={identifier} layout='position' layoutId={identifier}>
                  {char}
                </Character>
              );
            })}
          </Word>

          {index < array.length - 1 && ' '}
        </Fragment>
      ))}
    </span>
  );
});
