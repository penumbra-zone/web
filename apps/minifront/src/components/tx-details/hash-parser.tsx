import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@penumbra-zone/ui/components/ui/tabs';
import { JsonViewer } from '@penumbra-zone/ui/components/ui/json-viewer';
import { TransactionViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/transaction';
import { TxDetailsLoaderResult } from '.';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import type { Jsonified } from '@penumbra-zone/types/src/jsonified';
import { viewFromEmptyPerspective } from '@penumbra-zone/types/src/transaction/perspective';

export enum TxDetailsTab {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export const TxViewer = ({ txInfo, hash }: TxDetailsLoaderResult) => {
  return (
    <div>
      <div className='text-xl font-bold'>Transaction View</div>
      <div className='mb-8 break-all font-mono italic text-muted-foreground'>{hash}</div>
      <Tabs defaultValue={TxDetailsTab.PRIVATE}>
        <TabsList className='mx-auto grid w-3/4 grid-cols-2 gap-4 xl:w-[372px]'>
          <TabsTrigger value={TxDetailsTab.PRIVATE}>Your View</TabsTrigger>
          <TabsTrigger value={TxDetailsTab.PUBLIC}>Public View</TabsTrigger>
        </TabsList>
        <TabsContent value={TxDetailsTab.PRIVATE}>
          <TransactionViewComponent txv={txInfo.view!} />
          <div className='mt-8'>
            <div className='text-xl font-bold'>Raw JSON</div>
            <JsonViewer jsonObj={txInfo.toJson() as Jsonified<TransactionInfo>} />
          </div>
        </TabsContent>
        <TabsContent value={TxDetailsTab.PUBLIC} className='mt-10'>
          <TransactionViewComponent txv={viewFromEmptyPerspective(txInfo.transaction!)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
