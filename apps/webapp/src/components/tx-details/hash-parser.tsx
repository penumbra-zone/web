import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TransactionViewComponent,
} from '@penumbra-zone/ui';
import { viewFromEmptyPerspective } from '@penumbra-zone/types';
import JsonTree from './json-tree';
import { TxDetailsLoaderResult } from './index.tsx';

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
        <TabsList className='mx-auto grid w-[75%] grid-cols-2 gap-4 xl:w-[372px]'>
          <TabsTrigger value={TxDetailsTab.PRIVATE}>Your View</TabsTrigger>
          <TabsTrigger value={TxDetailsTab.PUBLIC}>Public View</TabsTrigger>
        </TabsList>
        <TabsContent value={TxDetailsTab.PRIVATE}>
          <TransactionViewComponent txv={txInfo.view!} />
          <div className='mt-8'>
            <div className='text-xl font-bold'>Raw JSON</div>
            <JsonTree jsonObj={txInfo.toJson() as object} />
          </div>
        </TabsContent>
        <TabsContent value={TxDetailsTab.PUBLIC} className='mt-10'>
          <TransactionViewComponent txv={viewFromEmptyPerspective(txInfo.transaction!)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
