import { MemoView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { AddressViewComponent } from './address-view';
import { ViewBox, ViewSection } from './viewbox';

export const MemoViewComponent = ({ memo: { memoView } }: { memo: MemoView }) => {
  switch (memoView.case) {
    case 'visible':
      return (
        <ViewSection heading='Memo'>
          <ViewBox
            label='Memo Text'
            visibleContent={
              <div>
                {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
                {memoView.value.plaintext?.text || (
                  <span className='italic text-gray-600'>== none ==</span>
                )}
              </div>
            }
          />
          <ViewBox
            label='Sender Return Address'
            visibleContent={<AddressViewComponent view={memoView.value.plaintext!.returnAddress} />}
          />
        </ViewSection>
      );
    case 'opaque':
      return (
        <ViewSection heading='Memo'>
          <ViewBox label='Memo Text' />
          <ViewBox label='Sender Return Address' />
        </ViewSection>
      );
    default:
      return <span>Invalid MemoView: &quot;{memoView.case}&quot;</span>;
  }
};
