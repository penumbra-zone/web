import type { JsonObject, JsonValue } from '@bufbuild/protobuf';
import { JsonView } from 'react-json-view-lite';

const collapseLevel = 3;

const objectDepth = (o: JsonValue): number =>
  o && typeof o === 'object' ? 1 + Math.max(-1, ...Object.values(o).map(objectDepth)) : 0;

const objectLength = (o: JsonValue): number =>
  o && typeof o === 'object' ? Object.entries(o).length : 0;

const shouldExpandNode = (level: number, value: JsonValue, field?: string) => {
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
};

export const JsonViewer = ({ jsonObj }: { jsonObj: JsonObject | JsonValue[] }) => {
  return (
    <div className='mt-5 rounded bg-black p-5'>
      <JsonView
        data={jsonObj}
        shouldExpandNode={shouldExpandNode}
        style={{
          container: 'bg-black whitespace-pre-wrap break-words font-mono -mx-4',
          basicChildStyle: 'mx-4 py-[2px]',
          label: 'font-semibold mr-1.5 text-gray-200',
          nullValue: 'text-red-600',
          undefinedValue: 'text-red-600',
          stringValue: 'text-amber-600',
          booleanValue: 'text-purple-600',
          numberValue: 'text-teal-600',
          otherValue: 'text-blue-600',
          punctuation: 'text-gray-500 mr-1.5',
          collapseIcon:
            'text-teal-200 text-[16px] p-1 mr-1.5 select-none cursor-pointer after:content-["▼"]',
          expandIcon:
            'text-teal-200 text-[16px] p-1 mr-1.5 select-none cursor-pointer after:content-["▶"]',
          collapsedContent: 'text-amber-600 mr-1.5 after:content-["..."] after:text-xs',
        }}
      />
    </div>
  );
};
