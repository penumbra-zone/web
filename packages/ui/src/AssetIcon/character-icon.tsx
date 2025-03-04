import { Text } from '../Text';

export interface CharacterIconProps {
  character: string;
}

export const CharacterIcon = ({ character }: CharacterIconProps) => {
  return (
    <div className='flex size-full min-w-full items-center justify-center rounded-full bg-secondary-main text-text-primary'>
      <Text detail align='center'>
        {character}
      </Text>
    </div>
  );
};
