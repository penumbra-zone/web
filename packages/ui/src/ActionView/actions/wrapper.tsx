import { ReactNode } from 'react';
import { IncognitoIcon } from './incognito-icon';
import { Text } from '../../Text';

export interface ActionWrapperProps {
  title: string;
  opaque?: boolean;
  children?: ReactNode;
}

export const ActionWrapper = ({ opaque, children, title }: ActionWrapperProps) => {
  // const density = useDensity();

  return (
    <div className='flex h-10 w-full items-center justify-between gap-1 rounded-sm bg-other-tonalFill5 px-3 py-2'>
      {opaque && (
        <i className='block text-neutral-light'>
          <IncognitoIcon />
        </i>
      )}

      <div className='grow truncate'>
        <Text smallTechnical color={opaque ? 'text.secondary' : 'text.primary'}>
          {title}
        </Text>
      </div>

      {!opaque && <div className='flex items-center gap-1'>{children}</div>}
    </div>
  );
};
