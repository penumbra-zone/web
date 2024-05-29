import { JsonViewer } from '@penumbra-zone/ui/components/ui/json-viewer';
import { TransactionViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/transaction';
import { TxDetailsLoaderResult } from '.';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import type { Jsonified } from '@penumbra-zone/types/jsonified';
import { viewFromEmptyPerspective } from '@penumbra-zone/perspective/transaction/perspective';
import { useId, useState } from 'react';
import { SegmentedPicker } from '@penumbra-zone/ui/components/ui/segmented-picker';
import { CumulativeLayoutIdProvider } from '@penumbra-zone/ui/components/contexts/cumulative-layout-id/provider';

export enum TxDetailsTab {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

const OPTIONS = [
  { label: 'Your View', value: TxDetailsTab.PRIVATE },
  { label: 'Public View', value: TxDetailsTab.PUBLIC },
];

export const TxViewer = ({ txInfo, hash }: TxDetailsLoaderResult) => {
  const [option, setOption] = useState(TxDetailsTab.PRIVATE);
  const layoutId = useId();

  return (
    <CumulativeLayoutIdProvider layoutId={layoutId}>
      <div>
        <div className='text-xl font-bold'>Transaction View</div>
        <div className='mb-8 break-all font-mono italic text-muted-foreground'>{hash}</div>

        <div className='mx-auto mb-4 max-w-[70%]'>
          <SegmentedPicker options={OPTIONS} value={option} onChange={setOption} grow size='lg' />
        </div>
        {option === TxDetailsTab.PRIVATE && (
          <>
            <TransactionViewComponent txv={txInfo.view!} />
            <div className='mt-8'>
              <div className='text-xl font-bold'>Raw JSON</div>
              <JsonViewer jsonObj={txInfo.toJson() as Jsonified<TransactionInfo>} />
            </div>
          </>
        )}
        {option === TxDetailsTab.PUBLIC && (
          <TransactionViewComponent txv={viewFromEmptyPerspective(txInfo.transaction!)} />
        )}
      </div>
    </CumulativeLayoutIdProvider>
  );
};
