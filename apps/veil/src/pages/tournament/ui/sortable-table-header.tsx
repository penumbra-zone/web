import cn from 'clsx';
import { ReactNode, useCallback, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Text } from '@penumbra-zone/ui/Text';

export type SortDirection = 'asc' | 'desc';

export interface SortableTableHeaderProps<KEY extends string = string> {
  sortKey: KEY;
  label: string;
  direction: SortDirection;
  onSort: (arg_1: { key: KEY; direction: SortDirection }) => void;
  active?: boolean;
}

export const SortableTableHeader = <KEY extends string = string>({
  sortKey,
  label,
  direction,
  onSort,
  active,
}: SortableTableHeaderProps<KEY>) => {
  return (
    <TableCell heading>
      <button
        className={cn(
          'flex items-center gap-1 border-none bg-none',
          active ? 'text-text-primary' : 'text-text-secondary',
        )}
        onClick={() => {
          onSort({
            key: sortKey,
            direction: active && direction === 'desc' ? 'asc' : 'desc',
          });
        }}
      >
        <Text tableHeadingMedium whitespace='nowrap'>
          {label}
        </Text>

        <i className='flex size-4 items-center justify-center'>
          {active ? (
            <>
              {direction === 'asc' ? (
                <ChevronUp className='size-3' />
              ) : (
                <ChevronDown className='size-3' />
              )}
            </>
          ) : (
            <ChevronsUpDown className='size-3' />
          )}
        </i>
      </button>
    </TableCell>
  );
};

export type GetTableHeader<KEY extends string = string> = (key: KEY, label: string) => ReactNode;

export const useSortableTableHeaders = <KEY extends string = string>(
  key: KEY | '' = '',
  direction: SortDirection = 'desc',
) => {
  const [sortBy, setSortBy] = useState<{
    key: KEY | '';
    direction: SortDirection;
  }>({
    key,
    direction,
  });

  const getTableHeader = useCallback<GetTableHeader<KEY>>(
    (key, label) => {
      return (
        <SortableTableHeader
          sortKey={key}
          label={label}
          direction={sortBy.direction}
          onSort={setSortBy}
          active={sortBy.key === key}
        />
      );
    },
    [sortBy],
  );

  return {
    sortBy,
    getTableHeader,
  };
};
