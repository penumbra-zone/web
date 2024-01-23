import { Button, TransactionViewComponent } from '@penumbra-zone/ui';
import { useStore } from '../../../state';
import { txApprovalSelector } from '../../../state/tx-approval';
import { JsonViewer } from '@penumbra-zone/ui/components/ui/json-viewer';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export const TransactionApproval = () => {
  const { authorizeRequest, transactionViewFromPlan, responder } = useStore(txApprovalSelector);

  if (!authorizeRequest?.plan || !responder || !transactionViewFromPlan) return null;

  return (
    <div className='flex h-screen flex-col justify-between p-[30px] pt-10 '>
      <div className='mb-20 overflow-auto'>
        <p className='bg-text-linear bg-clip-text font-headline text-2xl font-bold text-transparent'>
          Confirm transaction
        </p>

        <TransactionViewComponent txv={TransactionView.fromJson(transactionViewFromPlan)} />

        <div className='mt-8'>
          <JsonViewer jsonObj={authorizeRequest} />
        </div>
      </div>
      <div className='fixed inset-x-0 bottom-0 flex flex-col gap-4 bg-black px-6 py-4 shadow-lg'>
        <Button
          size='lg'
          variant='default'
          onClick={() => {
            responder({ type: 'TX-APPROVAL', data: true });
            window.close();
          }}
        >
          Approve
        </Button>
        <Button
          size='lg'
          variant='destructive'
          onClick={() => {
            responder({ type: 'TX-APPROVAL', data: false });
            window.close();
          }}
        >
          Deny
        </Button>
      </div>
    </div>
  );
};
