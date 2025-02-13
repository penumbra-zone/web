import { MemoView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { AddressViewComponent } from '@penumbra-zone/ui/AddressView';
import { ViewBox } from './viewbox';
import { ActionDetails } from './actions-views/action-details';

export const MemoViewComponent = ({ memo: { memoView } }: { memo: MemoView }) => {
  switch (memoView.case) {
    case 'visible':
      return (
        <ViewBox
          label='Memo'
          visibleContent={
            <div className='flex flex-col gap-4'>
              <ActionDetails>
                <ActionDetails.Row label='Return Address'>
                  {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- field is always populated when the component is rendered */}
                  <AddressViewComponent addressView={memoView.value.plaintext!.returnAddress} />
                </ActionDetails.Row>
                <ActionDetails.Row label='Memo Text'>
                  <span
                    className='overflow-visible pr-2 italic text-gray-300'
                    style={{ wordBreak: 'normal' }}
                  >
                    {memoView.value.plaintext?.text}
                  </span>
                </ActionDetails.Row>
              </ActionDetails>
            </div>
          }
        />
      );
    case 'opaque':
      return <ViewBox label='Memo' isOpaque={true} />;
    default:
      return <span>Invalid MemoView: &quot;{memoView.case}&quot;</span>;
  }
};
