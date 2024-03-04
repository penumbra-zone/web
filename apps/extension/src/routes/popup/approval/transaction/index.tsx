import { TransactionViewComponent } from '@penumbra-zone/ui';
import { useStore } from '../../../../state';
import { txApprovalSelector } from '../../../../state/tx-approval';
import { JsonViewer } from '@penumbra-zone/ui/components/ui/json-viewer';
import { Jsonified } from '@penumbra-zone/types';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { useTransactionViewSwitcher } from './use-transaction-view-switcher';
import { ViewTabs } from './view-tabs';
import { ApproveDeny } from '../approve-deny';

export const TransactionApproval = () => {
  const {
    authorizeRequest: authReqString,
    setAttitude,
    sendResponse,
  } = useStore(txApprovalSelector);

  const { selectedTransactionView, selectedTransactionViewName, setSelectedTransactionViewName } =
    useTransactionViewSwitcher();

  if (!authReqString) return null;
  const authorizeRequest = AuthorizeRequest.fromJsonString(authReqString);
  if (!authorizeRequest.plan || !selectedTransactionView) return null;

  const approve = () => {
    setAttitude(true);
    sendResponse();
    window.close();
  };

  const deny = () => {
    setAttitude(false);
    sendResponse();
    window.close();
  };

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
      <ApproveDeny approve={approve} deny={deny} wait={3} />
    </div>
  );
};
