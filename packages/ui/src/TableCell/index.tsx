import cn from 'clsx';
import { ReactNode } from 'react';
import { Density, useDensity } from '../utils/density';
import { Skeleton } from '../Skeleton';
import {
  tableHeading,
  tableHeadingMedium,
  tableHeadingSmall,
  tableItem,
  tableItemMedium,
  tableItemSmall,
} from '../utils/typography';

export type TableCellVariant = 'title' | 'heading' | 'cell' | 'lastCell' | 'footer';

type TableCellType = {
  [K in TableCellVariant]: Record<K, true> & Partial<Record<Exclude<TableCellVariant, K>, never>>;
}[TableCellVariant];

type TableCellPropType =
  | (TableCellType & { variant?: never })
  | (Partial<Record<TableCellVariant, never>> & {
      /** dynamic table cell type: `'title' | 'heading' | 'cell' | 'lastCell' | 'footer'` */
      variant?: TableCellVariant;
    });

export type TableCellProps = TableCellPropType & {
  children: ReactNode;
  loading?: boolean;
  /** Renders numbers in a monospace font with letters of equal size */
  numeric?: boolean;
};

const classesByVariant: Record<TableCellVariant, string> = {
  title: cn('text-text-primary'),
  heading: cn('text-text-secondary border-b border-b-other-tonalStroke'),
  cell: cn('text-text-primary border-b border-b-other-tonalStroke'),
  lastCell: cn('text-text-primary'),
  footer: cn('text-text-secondary'),
};

const classesByDensity: Record<Density, string> = {
  sparse: 'py-1 px-3 h-14',
  compact: 'py-1 px-3 h-12',
  slim: 'py-1 px-3 h-8',
};

const defaultFont: Record<Density, string> = {
  sparse: tableItem,
  compact: tableItemMedium,
  slim: tableItemSmall,
};

const headingFont: Record<Density, string> = {
  sparse: tableHeading,
  compact: tableHeadingMedium,
  slim: tableHeadingSmall,
};

/**
 * **TableCell** is a unified component for tables within Penumbra ecosystem.
 * It has multiple style variants:
 *
 * 1. `heading` – darkened bold text
 * 2. `cell` – regular info cell
 * 3. `title` – emphasized cell
 * 4. `lastCell` – borderless cell
 * 5. `footer` – borderless darkened cell
 *
 * You can pass the variant as a named prop (`<TableCell heading />`) or dynamically as a string (`<TableCell variant='heading' />`).
 *
 * Use `numeric` prop to render numbers in a monospace font with letters of equal size.
 *
 * Example table with **TableCell**:
 *
 * ```tsx
 * <div className='grid grid-cols-3'>
 *   <div className='col-span-3 grid grid-cols-subgrid'>
 *     <TableCell heading>Name</TableCell>
 *     <TableCell heading>Pill</TableCell>
 *     <TableCell heading>Amount</TableCell>
 *   </div>
 *   <div className='col-span-3 grid grid-cols-subgrid'>
 *     <TableCell cell loading>Hello</TableCell>
 *     <TableCell cell>
 *       <Pill>Pending</Pill>
 *     </TableCell>
 *     <TableCell cell numeric>
 *       11.1111
 *     </TableCell>
 *   </div>
 * </div>
 * ```
 */
export const TableCell = ({ children, loading, numeric, ...props }: TableCellProps) => {
  const density = useDensity();
  const type: TableCellVariant =
    props.variant ??
    (props.title && 'title') ??
    (props.heading && 'heading') ??
    (props.lastCell && 'lastCell') ??
    (props.footer && 'footer') ??
    (props.cell && 'cell') ??
    'cell';

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        classesByVariant[type],
        classesByDensity[density],
        type === 'heading' ? headingFont[density] : defaultFont[density],
        numeric && 'font-mono tabular-nums',
      )}
    >
      {loading ? (
        <div className='h-1/2 w-full max-w-14'>
          <Skeleton />
        </div>
      ) : (
        children
      )}
    </div>
  );
};
TableCell.displayName = 'TableCell';
