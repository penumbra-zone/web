import ReactJson from 'react-json-view';
import type { JsonObject, JsonValue } from '@bufbuild/protobuf';

import './overrides.css';

export const JsonViewer = ({ jsonObj }: { jsonObj: JsonObject | JsonValue[] }) => {
  return (
    <div className='mt-5 rounded bg-black p-5'>
      <ReactJson
        name={false}
        style={{ fontFamily: 'Iosevka Term' }}
        src={jsonObj}
        theme='bright'
        displayDataTypes={false}
        collapseStringsAfterLength={20}
        collapsed={2}
        displayObjectSize={false}
        enableClipboard={true}
      />
    </div>
  );
};
