import { BackIcon } from '@penumbra-zone/ui';
import { usePopupNav } from '../../utils/navigate';

export const SettingsHeader = ({ title }: { title: string }) => {
  const navigate = usePopupNav();
  return (
    <>
      <BackIcon
        className='absolute ml-[30px] mt-6 size-6 text-muted-foreground'
        onClick={() => navigate(-1)}
      />
      <h1 className='flex h-[70px] items-center justify-center border-b border-border-secondary font-headline text-xl font-semibold leading-[30px]'>
        {title}
      </h1>
    </>
  );
};
