import { TableCell } from '@penumbra-zone/ui/TableCell';
import { useIntersection } from '@/shared/utils/use-intersection';
import { useRef, useState } from 'react';
import { usePnL } from '../api/use-pnl';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export function PointsPnl({
  variant,
  baseAsset,
  quoteAsset,
  startTime,
  endTime,
}: {
  variant: 'cell' | 'lastCell';
  baseAsset: Metadata;
  quoteAsset: Metadata;
  startTime: number;
  endTime: number;
}) {
  const cellRef = useRef<HTMLTableRowElement>(null);
  const [enabled, setEnabled] = useState(false);

  const {
    data: pnl,
    error,
    isLoading,
  } = usePnL({
    variables: {
      baseAsset,
      quoteAsset,
      startTime,
      endTime,
    },
    enabled,
  });
  console.log('TCL: pnl', pnl);

  useIntersection(
    cellRef,
    isIntersecting => {
      setEnabled(isIntersecting);
    },
    {
      isIntersectingCallback: true,
    },
  );

  return (
    <div ref={cellRef} className='grid grid-cols-subgrid col-span-2 [&>*]:h-auto'>
      <TableCell numeric variant={variant} loading={isLoading}>
        {Math.abs(pnl?.pnlPercentChange)}
      </TableCell>
      <TableCell numeric variant={variant} loading={isLoading}>
        {pnl?.pnl}
      </TableCell>
    </div>
  );
}
