import { Progress } from 'ui';

export const BlockSync = () => {
  return (
    <div className='flex flex-col items-center gap-1 font-headline text-xl font-semibold leading-[30px] text-sand'>
      <p>Syncing blocks...</p>
      <Progress value={73} />
      <p>10982/121312</p>
    </div>
  );
};
