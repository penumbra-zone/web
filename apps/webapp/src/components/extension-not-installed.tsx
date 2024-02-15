import { EduPanel } from './shared/edu-panels/content';
import { EduInfoCard } from './shared/edu-panels/edu-info-card';

export const ExtensionNotInstalled = () => {
  return (
    <div className='relative mx-auto grid gap-6 md:grid-cols-2 md:gap-4 xl:max-w-[1276px] xl:grid-cols-3 xl:gap-5'>
      <div className='xl:order-1 xl:block' />
      <EduInfoCard
        className='order-1 md:order-2'
        src='./receive-gradient.svg'
        label='Install our extension'
        content={EduPanel.EXTENSION_NOT_INSTALLED}
      />
    </div>
  );
};
