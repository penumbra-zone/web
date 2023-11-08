import { useTxInfo } from '../../hooks/tx-info-by-hash';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TransactionViewComponent,
} from '@penumbra-zone/ui';
import { viewFromEmptyPerspective } from '@penumbra-zone/types';
import JsonTree from './json-tree';
import { useSearchParams } from 'react-router-dom';

export enum TxDetailsTab {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export default function HashParser() {
  const [searchParams] = useSearchParams();
  const hash = searchParams.get('hash');
  if (!hash) return <div>No Hash passed ❌</div>;

  return <TxViewer hash={hash} />;
}

const TxViewer = ({ hash }: { hash: string }) => {
  const { data, error, isError, isLoading } = useTxInfo(hash);
  if (isLoading) return <span className='text-yellow-600'>Loading...</span>;

  if (isError || !data?.transaction || !data.view) {
    return (
      <div className='text-red'>
        <div>${String(error)}</div>
        <div>=====================</div>
        <div>
          You may need to sync your blocks for this to be found. Or are you trying to view a
          transaction that you can&apos;t see? 🕵️
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='text-xl font-bold'>Transaction View</div>
      <div className='mb-8 break-all font-mono italic text-muted-foreground'>{hash}</div>
      <Tabs defaultValue={TxDetailsTab.PRIVATE}>
        <TabsList className='mx-auto grid grid-cols-2 gap-4 md:w-full xl:w-[372px]'>
          <TabsTrigger value={TxDetailsTab.PRIVATE}>Your View</TabsTrigger>
          <TabsTrigger value={TxDetailsTab.PUBLIC}>Public View</TabsTrigger>
        </TabsList>
        <TabsContent value={TxDetailsTab.PRIVATE}>
          <TransactionViewComponent txv={data.view} />
          <div className='mt-8'>
            <div className='text-xl font-bold'>Raw JSON</div>
            <JsonTree jsonObj={data.toJson() as object} />
          </div>
        </TabsContent>
        <TabsContent value={TxDetailsTab.PUBLIC} className='mt-10'>
          <TransactionViewComponent txv={viewFromEmptyPerspective(data.transaction)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
