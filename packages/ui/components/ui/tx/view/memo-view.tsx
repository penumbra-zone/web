import { MemoView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { AddressViewComponent } from './address-view';
import { ViewBox, ViewSection } from './viewbox';

export const MemoViewComponent = ({ memo }: { memo: MemoView | undefined }) => {
  if (!memo?.memoView.case) return null;
  if (memo.memoView.case === 'visible') {
    const mv = memo.memoView.value;
    const text = mv.plaintext?.text;

    return (
      <ViewSection heading='Memo'>
        <ViewBox
          label='Memo Text'
          visibleContent={
            /* Ensure that an empty memo string is rendered as a blank space, highlighting absence */
            text ? <div>{text}</div> : <div>&nbsp;</div>
          }
        />
        <ViewBox
          label='Sender Return Address'
          visibleContent={<AddressViewComponent view={mv.plaintext!.returnAddress} />}
        />
      </ViewSection>
    );
  }

  return (
    <ViewSection heading='Memo'>
      <ViewBox label='Memo Text' />
      <ViewBox label='Sender Return Address' />
    </ViewSection>
  );
};
