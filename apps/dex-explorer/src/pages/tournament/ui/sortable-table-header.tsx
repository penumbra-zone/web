import cn from 'clsx';
import { useCallback, useState } from 'react';
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
          'flex bg-none border-none items-center gap-1',
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

        <i className='flex items-center justify-center size-4'>
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

export const useSortableTableHeaders = <KEY extends string = string>() => {
  const [sortBy, setSortBy] = useState<{
    key: KEY | '';
    direction: SortDirection;
  }>({
    key: '',
    direction: 'desc',
  });

  const getTableHeader = useCallback(
    (key: KEY, label: string) => {
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
