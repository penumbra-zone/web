import {
  ChangeEventHandler,
  ElementType,
  KeyboardEventHandler,
  useId,
  useMemo,
  useRef,
} from 'react';
import cn from 'clsx';
import { ChevronsUpDown } from 'lucide-react';
import { Text } from '../Text';
import { Density } from '../Density';
import { Button } from '../Button';
import { ELLIPSIS_KEY, PaginationButton } from './pagination-button';

const LIMIT_OPTIONS = [10, 20, 50, 100];

export interface PaginationProps {
  /** The current page value */
  value: number;
  /** Callback function to update the current page value */
  onChange: (value: number) => void;
  /** The number of items per page. If 0 or less, doesn't render the limit selector */
  limit: number;
  /** The total number of items. If provided, will be used to calculate the total number of pages */
  totalItems: number;
  /** Actual amount of items per page. Provide it if different from `limit`. It doesn't affect page calculation, only the rendering of page info */
  visibleItems?: number;
  /** Callback function to update the number of items per page */
  onLimitChange?: (limit: number) => void;
  /** The available options list for the limit */
  limitOptions?: number[];
  /** If true, hides the left pagination info block that usually says "{currentPage} out of {totalPages}" */
  hidePageInfo?: boolean;
  /** If true, hides all buttons that help select a certain page, leaves only "prev" and "next" */
  hidePageButtons?: boolean;
  /** If true, hides the limit selector */
  hideLimitSelector?: boolean;
  as?: ElementType;
}

/**
 * Table pagination component. Displays buttons to navigate between pages
 * and a page limit selector.
 *
 * Example usage:
 *
 * ```tsx
 * const TableDemo = () => {
 *   const [value, setValue] = useState(1);
 *   const [limit, setLimit] = useState<number>(20);
 *
 *   // Generate an array of 300 elements and slice it based on the current page and limit values
 *   const array = Array.from({ length: 300 }, (_, i) => i + 1);
 *   const values = array.slice(limit * (value - 1), limit * value);
 *
 *   // Reset the page value when the limit changes
 *   const onLimit = (limit: number) => {
 *     setLimit(limit);
 *     setValue(1);
 *   };
 *
 *   return (
 *     <div className='flex flex-col gap-2'>
 *       <Pagination
 *         totalItems={array.length}
 *         value={value}
 *         onChange={setValue}
 *         limit={limit}
 *         onLimitChange={onLimit}
 *       />
 *
 *       <ul className='text-text-secondary'>
 *         {values.map(v => (
 *           <li className='text-xs' key={v}>
 *             {v}
 *           </li>
 *         ))}
 *       </ol>
 *     </div>
 *   );
 * }
 * ```
 */
export const Pagination = ({
  as: Container = 'div',
  value,
  onChange,
  totalItems,
  visibleItems,
  hidePageInfo,
  hidePageButtons,
  hideLimitSelector,
  limitOptions,
  limit,
  onLimitChange,
}: PaginationProps) => {
  const selectId = useId();
  const selectEl = useRef<HTMLSelectElement>(null);
  const pages = useMemo(() => {
    return Math.ceil((totalItems < 1 ? 1 : totalItems) / limit);
  }, [limit, totalItems]);

  const limitOptionsSet = useMemo(() => {
    const options = limitOptions ?? LIMIT_OPTIONS;
    if (!options.includes(limit)) {
      options.push(limit);
    }
    options.sort((a, b) => a - b);
    return options;
  }, [limit, limitOptions]);

  // Calculates which buttons to show. The first, last and current page are always shown
  const maxVisible = 3;
  const buttons = useMemo(() => {
    if (pages < 2) {
      return [1];
    }

    if (pages <= 5) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }

    const arr: (number | typeof ELLIPSIS_KEY)[] = [];

    // Always show the first page
    arr.push(1);

    if (value > maxVisible) {
      arr.push(ELLIPSIS_KEY);
    }

    // Show pages around the current page
    const startPage = Math.max(2, value - 1);
    const endPage = Math.min(pages - 1, value + 1);
    for (let i = startPage; i <= endPage; i++) {
      arr.push(i);
    }

    if (value < pages - maxVisible) {
      arr.push(ELLIPSIS_KEY);
    }

    // Always show the last page
    arr.push(pages);

    return arr;
  }, [pages, value]);

  const onLabelClick = () => {
    selectEl.current?.showPicker();
  };

  const onLabelEnter: KeyboardEventHandler<HTMLLabelElement> = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      selectEl.current?.showPicker();
    }
  };

  const onPrev = () => {
    onChange(value - 1 <= 1 ? 1 : value - 1);
  };

  const onNext = () => {
    onChange(value + 1 >= pages ? pages : value + 1);
  };

  const onChangeValue = (newValue: number) => {
    if (newValue < 1) {
      onChange(1);
    } else if (newValue > pages) {
      onChange(pages);
    } else {
      onChange(newValue);
    }
  };

  const onSelect: ChangeEventHandler<HTMLSelectElement> = event => {
    onLimitChange?.(parseInt(event.target.value));
  };

  return (
    <Container
      className={cn(
        'grid w-full items-center gap-x-6 gap-y-2 text-text-secondary',
        'grid-cols-2 grid-rows-2',
        'tablet:grid-cols-[auto_1fr_auto] tablet:grid-rows-1',
      )}
    >
      <div className='col-start-1 row-start-1 whitespace-nowrap'>
        {hidePageInfo ? null : (
          <Text small>
            {visibleItems ?? (limit < totalItems ? limit : totalItems)} out of {totalItems}
          </Text>
        )}
      </div>

      <nav
        className={cn(
          'flex items-center justify-center gap-1 tablet:gap-3',
          'col-start-1 col-end-3 row-start-2', // mobile
          'tablet:col-start-2 tablet:row-start-1', // tablet/desktop
        )}
      >
        <Density compact>
          <Button priority='primary' disabled={value <= 1} onClick={onPrev}>
            Prev
          </Button>
        </Density>

        {hidePageButtons ? (
          <Text small>
            {value} of {pages}
          </Text>
        ) : (
          <div className='flex items-center tablet:gap-3'>
            {buttons.map((key, index) => (
              <PaginationButton
                key={index}
                value={key}
                active={value === key}
                onClick={onChangeValue}
              />
            ))}
          </div>
        )}

        <Density compact>
          <Button priority='primary' disabled={!!pages && value >= pages} onClick={onNext}>
            Next
          </Button>
        </Density>
      </nav>

      <div className='relative col-start-2 row-start-1 tablet:col-start-3'>
        {!hideLimitSelector && limit > 0 && (
          <>
            <label
              role='button'
              className='flex cursor-pointer items-center justify-end gap-1 whitespace-nowrap text-text-secondary'
              htmlFor={selectId}
              aria-haspopup='listbox'
              tabIndex={0}
              onClick={onLabelClick}
              onKeyDown={onLabelEnter}
            >
              <Text small>Show {limit}</Text>
              <i className='flex size-4 items-center justify-center text-neutral-light'>
                <ChevronsUpDown className='size-3' />
              </i>
            </label>

            <select
              ref={selectEl}
              id={selectId}
              value={limit}
              onChange={onSelect}
              className='invisible absolute top-0 left-0'
            >
              {limitOptionsSet.map(option => (
                <option key={option.toString()} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </Container>
  );
};
