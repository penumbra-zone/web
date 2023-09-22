import { ReactElement } from 'react';
import { Button } from 'ui/components';

interface LinkProps {
  icon: ReactElement;
  title: string;
  onClick: () => void;
}

export const CustomLink = ({ icon, title, onClick }: LinkProps) => {
  return (
    <Button
      variant='ghost'
      className='flex w-full items-center justify-start gap-2 p-[10px] text-left hover:bg-transparent hover:opacity-50'
      onClick={onClick}
    >
      <div className='h-[22px]'>{icon}</div>
      <p className='text-muted-foreground'>{title}</p>
    </Button>
  );
};
