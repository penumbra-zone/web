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
 */
export const CharacterTransition = memo(({ children }: CharacterTransitionProps) => {
  if (!children) {
    return null;
  }

  const charCounts: Record<string, number> = {};

  return children.split(' ').map((word, index, array) => (
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
  ));
});
