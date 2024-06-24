import { Button } from '@repo/ui/components/ui/button';
import { devFrontend, prodFrontend } from '../constants';

export const FrontendReferral = () => {
  const onClickHandler = () => {
    window.open(import.meta.env.DEV ? devFrontend : prodFrontend);
  };

  return (
    <Button variant='gradient' onClick={onClickHandler} className='w-full'>
      Frontend app
    </Button>
  );
};
