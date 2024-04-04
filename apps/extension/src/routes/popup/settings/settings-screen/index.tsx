import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { SettingsHeader } from './settings-header';
import { ReactNode } from 'react';

/**
 * A base settings screen template.
 */
export const SettingsScreen = ({
  title,
  IconComponent,
  children,
}: {
  title: string;
  IconComponent?: () => JSX.Element;
  children: ReactNode;
}) => {
  return (
    <FadeTransition>
      <div className='flex min-h-screen w-screen flex-col gap-6'>
        <SettingsHeader title={title} />

        {!!IconComponent && (
          <div className='mx-auto size-20'>
            <IconComponent />
          </div>
        )}

        <div className='px-[30px] pb-[30px]'>{children}</div>
      </div>
    </FadeTransition>
  );
};
