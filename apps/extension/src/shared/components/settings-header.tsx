import { BackIcon } from 'ui/components';
import { usePopupNav } from '../../utils/navigate';

export const SettingsHeader = ({ title }: { title: string }) => {
  const navigate = usePopupNav();
  return (
    <>
      <BackIcon
        className='absolute h-6 w-6 text-muted-foreground ml-[30px] mt-6'
        onClick={() => navigate(-1)}
      />
      <h1 className='border-b h-[60px] border-[rgba(75,75,75,0.50)] pb-2 pt-5 text-center text-3xl font-headline'>
        {title}
      </h1>
    </>
  );
};
