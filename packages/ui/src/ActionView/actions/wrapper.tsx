import cn from 'clsx';
import { ReactNode } from 'react';
import { Text } from '../../Text';
import { IncognitoIcon } from './incognito-icon';
import { useDensity } from '../../utils/density';

export interface ActionWrapperProps {
  title: string;
  opaque?: boolean;
  children?: ReactNode;
  /** Use `ActionRow` component to render an array of additional info rows */
  infoRows?: ReactNode;
}

const ActionWrapperHeader = ({ opaque, children, title }: ActionWrapperProps) => {
  return (
    <>
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

      <div className='flex items-center gap-1'>{children}</div>
    </>
  );
};

export const ActionWrapper = (props: ActionWrapperProps) => {
  const density = useDensity();
  const { infoRows } = props;

  if (!infoRows) {
    return (
      <div className='flex h-10 w-full items-center justify-between gap-1 rounded-sm bg-other-tonalFill5 px-3 py-2'>
        <ActionWrapperHeader {...props} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col rounded-sm bg-other-tonalFill5 px-3 py-2',
        density === 'sparse' ? 'gap-2' : 'gap-1',
      )}
    >
      <div className='flex w-full items-center justify-between gap-1'>
        <ActionWrapperHeader {...props} />
      </div>

      {infoRows}
    </div>
  );
};
