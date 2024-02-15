import { HeadTag } from './metadata/head-tag';
import { EduPanel } from './shared/edu-panels/content';
import { EduInfoCard } from './shared/edu-panels/edu-info-card';

export const ExtensionNotInstalled = () => {
  return (
    <>
      <HeadTag />
      <main className='flex h-screen items-center justify-center'>
        <EduInfoCard
          className='order-1 md:order-2'
          src='./receive-gradient.svg'
          label='Install our extension'
          content={EduPanel.EXTENSION_NOT_INSTALLED}
        />
      </main>
    </>
  );
};
