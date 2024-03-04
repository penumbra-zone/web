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
    <div className='fixed inset-x-0 bottom-0 flex flex-col gap-4 bg-black px-6 py-4 shadow-lg'>
      <Button size='lg' variant='default' onClick={approve} disabled={!!count}>
        Approve {count !== 0 && `(${count})`}
      </Button>
      <Button size='lg' variant='destructive' onClick={deny}>
        Deny
      </Button>
      {ignore && (
        <Button size='lg' variant='destructive' className='bg-black' onClick={ignore}>
          Always Deny
        </Button>
      )}
    </div>
  );
};
