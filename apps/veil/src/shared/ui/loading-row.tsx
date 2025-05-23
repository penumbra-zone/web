import { TableCell, TableCellVariant } from '@penumbra-zone/ui/TableCell';
import cn from 'clsx';

const COLSPAN_CLASSES: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
};

export interface LoadingRowProps {
  /** The amount of cells in a loading row */
  cells: number;
  cellVariant?: TableCellVariant;
  className?: string;
}

/**
 * A component that simplifies creation of loading rows
 * within a standard table using TableCell
 */
export const LoadingRow = ({ cells, className, cellVariant = 'cell' }: LoadingRowProps) => {
  return (
    <div className={cn('grid grid-cols-subgrid', COLSPAN_CLASSES[cells], className)}>
      {new Array(cells).fill({}).map((_, index) => (
        <TableCell key={index} variant={cellVariant} loading>
          undefined
        </TableCell>
      ))}
    </div>
  );
};
