import { Button } from '@penumbra-zone/ui';
import { useEffect } from 'react';
import { useCountdown } from 'usehooks-ts';

export const ApproveDeny = ({
  approve,
  deny,
  ignore,
  variants,
  wait = 0,
}: {
  approve: () => void;
  deny: () => void;
  ignore?: () => void;
  variants?: Parameters<typeof Button>[0]['variant'][];
  wait?: number;
}) => {
  const [count, { startCountdown }] = useCountdown({ countStart: wait });
  useEffect(startCountdown, [startCountdown]);

  return (
    <div className='fixed inset-x-0 bottom-0 flex flex-row flex-wrap justify-center gap-4 bg-black p-4 shadow-lg'>
      <Button
        variant={variants?.[0] ?? 'default'}
        className='w-full'
        size='lg'
        onClick={approve}
        disabled={!!count}
      >
        Approve {count !== 0 && `(${count})`}
      </Button>
      <Button
        className='min-w-[50%] grow hover:bg-destructive/90'
        size='lg'
        variant={variants?.[1] ?? 'destructive'}
        onClick={deny}
      >
        Deny
      </Button>
      {ignore && (
        <Button
          className='w-1/3 hover:bg-destructive/90'
          size='lg'
          variant={variants?.[2] ?? 'secondary'}
          onClick={ignore}
        >
          Ignore Site
        </Button>
      )}
    </div>
  );
};
