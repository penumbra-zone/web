import { Button } from '@penumbra-zone/ui';
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
    <div className='fixed inset-x-0 bottom-0 flex flex-row flex-wrap justify-center gap-4 bg-black p-4 shadow-lg'>
      <Button className='w-full' size='lg' variant='default' onClick={approve} disabled={!!count}>
        Approve {count !== 0 && `(${count})`}
      </Button>
      <Button className='min-w-[50%] grow' size='lg' variant='destructive' onClick={deny}>
        Deny
      </Button>
      {ignore && (
        <Button className='w-1/3 bg-black' size='lg' variant='destructive' onClick={ignore}>
          Ignore Site
        </Button>
      )}
    </div>
  );
};
