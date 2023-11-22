import { MemoView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { AddressViewComponent } from './address-view';
import { ViewBox, ViewSection } from './viewbox';
import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';

export const MemoViewComponent = ({ memo }: { memo: MemoView }) => {
  if (memo.memoView.case === 'visible') {
    const mv = memo.memoView.value;
    const text = mv.plaintext?.text;

    const av = new AddressView({
      addressView: {
        case: 'opaque',
        value: { address: mv.plaintext!.returnAddress!.addressView.value!.address! },
      },
    });

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
          visibleContent={<AddressViewComponent view={av} />}
        />
      </ViewSection>
    );
  }

  if (memo.memoView.case === 'opaque') {
    return (
      <ViewSection heading='Memo'>
        <ViewBox label='Memo Text' />
        <ViewBox label='Sender Return Address' />
      </ViewSection>
    );
  }

  return <span>Invalid MemoView</span>;
};
