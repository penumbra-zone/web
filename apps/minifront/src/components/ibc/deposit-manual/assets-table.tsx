import { useChainConnector, useCosmosChainBalances } from './hooks';
import { useStore } from '../../../state';
import { ibcInSelector } from '../../../state/ibc-in';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@penumbra-zone/ui-deprecated/components/ui/table';
import { Avatar, AvatarImage } from '@penumbra-zone/ui-deprecated/components/ui/avatar';
import { Identicon } from '@penumbra-zone/ui-deprecated/components/ui/identicon';
import { LineWave } from 'react-loader-spinner';
import { getIconWithUmFallback } from './asset-utils.tsx';

export const AssetsTable = () => {
  const { address } = useChainConnector();
  const { selectedChain } = useStore(ibcInSelector);
  const { data, isLoading, error } = useCosmosChainBalances();

  // User has not connected their wallet yet
  if (!address || !selectedChain) {
    return;
  }

  if (isLoading) {
    return (
      <div className='flex justify-center text-white'>
        <span className='text-white'>Loading balances...</span>
        <LineWave visible={true} height='70' width='70' color='white' wrapperClass='-mt-9' />
      </div>
    );
  }

  if (error) {
    return <div className='flex justify-center italic text-red-700'>{String(error)}</div>;
  }

  return (
    <div className='text-white'>
      <div className='flex justify-center italic text-stone-400'>
        Balances on {selectedChain.label}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[100px]'>Asset</TableHead>
            <TableHead className='text-right'>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.length === 0 && noBalancesRow()}
          {data?.map(b => {
            return (
              <TableRow key={b.displayDenom}>
                <TableCell className='flex gap-2'>
                  <Avatar className='size-6'>
                    <AvatarImage src={getIconWithUmFallback(b)} />
                    <Identicon uniqueIdentifier={b.displayDenom} type='gradient' size={22} />
                  </Avatar>
                  <span className='max-w-[200px] truncate'>{b.displayDenom}</span>
                </TableCell>
                <TableCell className='text-right'>{b.displayAmount}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const noBalancesRow = () => {
  return (
    <TableRow>
      <TableCell className='italic'>No balances</TableCell>
    </TableRow>
  );
};
