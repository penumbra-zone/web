import { Button, TransactionViewComponent } from '@penumbra-zone/ui';
import { useStore } from '../../../../state';
import { txApprovalSelector } from '../../../../state/tx-approval';
import { JsonViewer } from '@penumbra-zone/ui/components/ui/json-viewer';
import { Jsonified } from '@penumbra-zone/types';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { useTransactionViewSwitcher } from './use-transaction-view-switcher';
import { ViewTabs } from './view-tabs';
import { useCountdown } from 'usehooks-ts';
import { useEffect } from 'react';

export const TransactionApproval = () => {
  const {
    authorizeRequest: authReqString,
    setAttitude,
    sendResponse,
  } = useStore(txApprovalSelector);

  const { selectedTransactionView, selectedTransactionViewName, setSelectedTransactionViewName } =
    useTransactionViewSwitcher();

  const [count, { startCountdown }] = useCountdown({ countStart: 3 });
  useEffect(startCountdown, [startCountdown]);

  if (!authReqString) return null;
  const authorizeRequest = AuthorizeRequest.fromJsonString(authReqString);
  if (!authorizeRequest.plan || !selectedTransactionView) return null;

  return (
    <div className='flex h-screen flex-col justify-between'>
      <div className='grow overflow-auto p-[30px] pt-10'>
        <p className='bg-text-linear bg-clip-text font-headline text-2xl font-bold text-transparent'>
          Confirm transaction
        </p>

        <ViewTabs
          defaultValue={selectedTransactionViewName}
          onValueChange={setSelectedTransactionViewName}
        />

        <TransactionViewComponent txv={selectedTransactionView} />

        <div className='mt-8'>
          <JsonViewer jsonObj={authorizeRequest.toJson() as Jsonified<AuthorizeRequest>} />
        </div>
      </div>
      <div className='inset-x-0 bottom-0 flex flex-col gap-4 bg-black px-6 py-4 shadow-lg'>
        <Button
          size='lg'
          variant='default'
          onClick={() => {
            setAttitude(true);
            sendResponse();
            window.close();
          }}
          disabled={!!count}
        >
          Approve {count !== 0 && `(${count})`}
        </Button>
        <Button
          size='lg'
          variant='destructive'
          onClick={() => {
            setAttitude(false);
            sendResponse();
            window.close();
          }}
        >
          Deny
        </Button>
      </div>
    </div>
  );
};
