import { Button } from '@penumbra-zone/ui/components/ui/button';
import { useEffect } from 'react';
import { useCountdown } from 'usehooks-ts';

export const ApproveDeny = ({
  approve,
  deny,
  ignore,
  wait = 0,
}: {
  approve: () => void;
  deny: () => void;
  ignore?: () => void;
  wait?: number;
}) => {
  const [count, { startCountdown }] = useCountdown({ countStart: wait });
  useEffect(startCountdown, [startCountdown]);

  return (
    <div className='flex flex-row flex-wrap justify-center gap-4 bg-black p-4 shadow-lg'>
      <Button variant='gradient' className='w-full' size='lg' onClick={approve} disabled={!!count}>
        Approve {count !== 0 && `(${count})`}
      </Button>
      <Button
        className='min-w-[50%] grow items-center gap-2 hover:bg-destructive/90'
        size='lg'
        variant='destructiveSecondary'
        onClick={deny}
      >
        Deny
      </Button>
      {ignore && (
        <Button
          className='w-1/3 hover:bg-destructive/90'
          size='lg'
          variant='secondary'
          onClick={ignore}
        >
          Ignore Site
        </Button>
      )}
    </div>
  );
};
