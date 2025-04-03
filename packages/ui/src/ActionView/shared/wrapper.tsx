import cn from 'clsx';
import { ReactNode } from 'react';
import { Text } from '../../Text';
import { IncognitoIcon } from '../actions/incognito-icon';
import { Density, useDensity } from '../../utils/density';

export interface ActionWrapperProps {
  title: string;
  opaque?: boolean;
  children?: ReactNode;
  /** Use `ActionRow` component to render an array of additional info rows */
  infoRows?: ReactNode;
}

export interface ActionWrapperHeaderProps extends ActionWrapperProps {
  density: Density;
}

const ActionWrapperHeader = ({ opaque, children, title, density }: ActionWrapperHeaderProps) => {
  return (
    <>
      {opaque && (
        <i className='block text-neutral-light'>
          <IncognitoIcon />
        </i>
      )}

      <div className='flex grow items-center truncate'>
        <Text
          variant={density === 'sparse' ? 'smallTechnical' : 'detailTechnical'}
          color={opaque ? 'text.secondary' : 'text.primary'}
          truncate
        >
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
        <ActionWrapperHeader density={density} {...props} />
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
        <ActionWrapperHeader density={density} {...props} />
      </div>

      {infoRows}
    </div>
  );
};
