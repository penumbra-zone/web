import { motion } from 'framer-motion';
import { Fragment, memo } from 'react';
import styled from 'styled-components';

const WordWrapper = styled.span`
  white-space: nowrap;
`;

export interface CharacterTransitionProps {
  /**
   * Note that `children` must be a string -- not any other type of React node
   * -- so that it can be split into individual characters.
   */
  children?: string;
}

const Span = styled(motion.span)`
  display: inline-block;
`;

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
      <WordWrapper>
        {word.split('').map(char => {
          charCounts[char] = charCounts[char] ? charCounts[char] + 1 : 1;
          const identifier = `${char}${charCounts[char]}`;

          return (
            <Span key={identifier} layout='position' layoutId={identifier}>
              {char}
            </Span>
          );
        })}
      </WordWrapper>
      {index < array.length - 1 && ' '}
    </Fragment>
  ));
});
