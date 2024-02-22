import { Button } from '@penumbra-zone/ui';
import { devFrontend, prodFrontend } from '../constants.ts';

export const FrontendReferral = () => {
  const onClickHandler = () => {
    window.open(import.meta.env.MODE === 'production' ? prodFrontend : devFrontend);
  };

  return (
    <Button variant='gradient' onClick={onClickHandler} className='w-full'>
      Frontend app
    </Button>
  );
};
