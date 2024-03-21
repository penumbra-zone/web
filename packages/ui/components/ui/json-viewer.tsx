import type { JsonObject, JsonValue } from '@bufbuild/protobuf';
import { JsonView } from 'react-json-view-lite';
import { cn } from '../../lib/utils';
import { CopyToClipboardIconButton } from './copy-to-clipboard-icon-button';
import { DoubleArrowDownIcon, DoubleArrowUpIcon } from '@radix-ui/react-icons';
import { Button } from './button';
import { useCallback, useState } from 'react';

const collapseLevel = 3;

const objectDepth = (o: JsonValue): number =>
  o && typeof o === 'object' ? 1 + Math.max(-1, ...Object.values(o).map(objectDepth)) : 0;

const objectLength = (o: JsonValue): number =>
  o && typeof o === 'object' ? Object.entries(o).length : 0;

export const JsonViewer = ({ jsonObj }: { jsonObj: JsonObject | JsonValue[] }) => {
  const [expandAll, setExpandAll] = useState(false);

  const shouldExpandNode = useCallback(
    (level: number, value: JsonValue, field?: string) => {
      if (expandAll) return true;
      if (
        // exmpand empty, so they can be collapsed by css
        objectLength(value) === 0 ||
        objectDepth(value) === 0 ||
        // expand arrays
        Array.isArray(value) ||
        // always expand below minimum
        level < collapseLevel
      )
        return true;
      // begin to collapse, small objects stay open
      if (level === collapseLevel) return !field && objectLength(value) < 2;
      if (level === collapseLevel + 1) return !field && objectLength(value) < 2;
      // close all objects
      if (level === collapseLevel + 2) return false;

      // nested hidden objects stay open
      return true;
    },
    [expandAll],
  );

  return (
    <div className='mt-5 rounded bg-black p-5'>
      <div className='relative w-full'>
        <div className='absolute right-0 top-0 w-full'>
          <div className='relative flex items-end justify-end gap-2 text-muted-foreground'>
            <ExpandAllIconButton expandAll={expandAll} setExpandAll={setExpandAll} />
            <CopyToClipboardIconButton text={JSON.stringify(jsonObj)} />
          </div>
        </div>
      </div>
      <JsonView
        data={jsonObj}
        shouldExpandNode={shouldExpandNode}
        style={{
          container: cn(
            'font-mono',
            'mr-[3em]', // pad on the right side, for balance
            'text-ellipsis', // visually truncate long strings on the right side
            '[&>div>span:first-child]:hidden', // hide first collapse arrow
          ),
          basicChildStyle: cn(
            'text-gray-500',
            'break-keep truncate', // don't break strings, visually truncate
            'pl-[1em]', // indent each level
            // compact display if no children
            '[&:not(:has(div))]:block',
            'only-of-type:[&:not(:has(div))]:p-0',
            'only-of-type:[&:not(:has(div>div))]:inline',
            'only-of-type:[&:not(:has(div>div))]:*:inline',
            '[&>span:last-child]:mr-2', // space after last item, for compact display
          ),
          label: cn(
            'text-gray-200',
            'inline',
            'mr-2', // space after label
          ),
          nullValue: 'text-red-600',
          undefinedValue: 'text-red-600',
          noQuotesForStringValues: true, // quotes will be styled
          stringValue: cn(
            'text-amber-600',
            'select-all', // entire string selected on click
            // quotes from style, so they don't get selected
            "before:content-['“'] before:text-gray-500",
            "after:content-['”'] after:text-gray-500",
          ),
          booleanValue: 'text-purple-600',
          numberValue: 'text-teal-200',
          otherValue: 'text-blue-600',
          punctuation: cn(
            'text-gray-500',
            'inline text-sm',
            'has-[~div]:mr-2', // space if next item is a label
          ),
          collapseIcon: cn(
            'text-teal-600 text-lg',
            "has-[~div>div:nth-of-type(2)]:after:content-['▼']",
            'leading-[0] w-0 inline-block relative -left-3',
          ),
          expandIcon: 'hidden', // use collapsedContent ellipsis to expand
          collapsedContent: "text-teal-600 text-xs leading-[0] after:content-['•••'] after:mx-2",
        }}
      />
    </div>
  );
};

const ExpandAllIconButton = ({
  expandAll,
  setExpandAll,
}: {
  expandAll?: boolean;
  setExpandAll: (e: boolean) => void;
}) => (
  <Button
    className={cn('block', 'size-4')}
    variant='link'
    onClick={() => setExpandAll(!expandAll)}
    size='sm'
  >
    <div className='size-4 hover:opacity-50'>
      {!expandAll ? <DoubleArrowDownIcon /> : <DoubleArrowUpIcon />}
    </div>
  </Button>
);
