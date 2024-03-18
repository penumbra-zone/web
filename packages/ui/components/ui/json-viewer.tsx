import type { JsonObject, JsonValue } from '@bufbuild/protobuf';
import { JsonView } from 'react-json-view-lite';

export const JsonViewer = ({ jsonObj }: { jsonObj: JsonObject | JsonValue[] }) => {
  return (
    <div className='mt-5 rounded bg-black p-5'>
      <JsonView
        data={jsonObj}
        shouldExpandNode={level => level < 2}
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
            'text-teal-200 text-[10px] mr-1.5 select-none cursor-pointer after:content-["▼"]',
          expandIcon:
            'text-teal-200 text-[10px] mr-1.5 select-none cursor-pointer after:content-["▶"]',
          collapsedContent: 'text-amber-600 mr-1.5 after:content-["..."] after:text-xs',
          noQuotesForStringValues: false,
        }}
      />
    </div>
  );
};
