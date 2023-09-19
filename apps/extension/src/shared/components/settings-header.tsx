import { BackIcon } from 'ui/components';
import { usePopupNav } from '../../utils/navigate';

export const SettingsHeader = ({ title }: { title: string }) => {
  const navigate = usePopupNav();
  return (
    <>
      <BackIcon
        className='absolute ml-[30px] mt-6 h-6 w-6 text-muted-foreground'
        onClick={() => navigate(-1)}
      />
      <h1 className='h-[60px] border-b border-border-secondary pb-2 pt-5 text-center font-headline text-3xl'>
        {title}
      </h1>
    </>
  );
};
