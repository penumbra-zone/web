'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui';
import { FilledImage } from '../../shared';
// import { formatNumber } from '../../utils';
import { assets } from 'penumbra-constants';

export const AssetsTable = () => {
  // TODO get balances
  // const balances = useMemo(() => client.balances({}), []);
  // const { data, end, error } = useStreamQuery(balances);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead className='text-center'>Portfolio %</TableHead>
          <TableHead className='text-center'>Price (24hr)</TableHead>
          <TableHead className='text-center'>Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map(i => (
          <TableRow key={i.display}>
            <TableCell>
              <div className='flex items-center gap-4'>
                {i.icon && <FilledImage src={i.icon} alt='Asset' className='h-6 w-6' />}
                <p className='text-base font-bold'>{i.display}</p>
              </div>
            </TableCell>
            <TableCell className='text-center'>100%</TableCell>
            <TableCell className='text-center'>
              <div className='flex flex-col'>
                <p>$1,577.15</p>
                <p className='text-[15px] font-normal leading-[22px] text-red'>-$15.19 (-0.95%)</p>
              </div>
            </TableCell>
            <TableCell className='text-center'>
              <div className='flex flex-col'>
                <p className='text-[15px] font-bold leading-[22px]'>
                  {/* {formatNumber(i.balance)} {i.name} */}
                </p>
                <p className='text-[15px] font-normal leading-[22px] text-muted-foreground'>
                  $1.58
                </p>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
