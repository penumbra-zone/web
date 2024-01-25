import { Button } from '@penumbra-zone/ui';
import { useStore } from '../../../state';
import { originApprovalSelector } from '../../../state/origin-approval';

export const ConnectApproval = () => {
  const { requestOrigin, responder } = useStore(originApprovalSelector);

  console.log('connectapproval', requestOrigin, responder);
  if (!requestOrigin || !responder) return null;

  return (
    <div className='flex h-screen flex-col justify-between p-[30px] pt-10 '>
      <div className='mb-20 overflow-auto'>
        <p className='bg-text-linear bg-clip-text font-headline text-2xl font-bold text-transparent'>
          Confirm connection
          {requestOrigin}
        </p>
      </div>
      <div className='fixed inset-x-0 bottom-0 flex flex-col gap-4 bg-black px-6 py-4 shadow-lg'>
        <Button
          size='lg'
          variant='default'
          onClick={() => {
            responder({ type: 'ORIGIN-APPROVAL', data: true });
            window.close();
          }}
        >
          Approve
        </Button>
        <Button
          size='lg'
          variant='destructive'
          onClick={() => {
            responder({ type: 'ORIGIN-APPROVAL', data: false });
            window.close();
          }}
        >
          Deny
        </Button>
      </div>
    </div>
  );
};
