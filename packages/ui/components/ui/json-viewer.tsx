import { JsonViewer as TextaJsonViewer, NamedColorspace } from '@textea/json-viewer';

import type { JsonObject, JsonValue } from '@bufbuild/protobuf';

export const customTheme: NamedColorspace = {
  scheme: 'custom',
  author: 'penumbra',
  base00: '#000000', // Background Color
  base01: '#ffffff',
  base02: '#212121', // Nested section border color
  base03: '#ffffff',
  base04: '#626262', // Item count Color
  base05: '#ffffff',
  base06: '#ffffff',
  base07: '#ffffff',
  base08: '#ffffff',
  base09: '#ff7900', // Value Color
  base0A: '#ffffff',
  base0B: '#98c379',
  base0C: '#09eed1', // Array index Color
  base0D: '#ffffff',
  base0E: '#ffffff',
  base0F: '#ffffff',
};

export const JsonViewer = ({ jsonObj }: { jsonObj: JsonObject | JsonValue[] }) => {
  return (
    <div className='mt-5 rounded bg-black p-5'>
      <TextaJsonViewer
        value={jsonObj}
        style={{ fontFamily: 'Iosevka Term' }}
        theme={customTheme}
        rootName={false}
        enableClipboard={true}
        defaultInspectDepth={2}
        quotesOnKeys={false}
      />
    </div>
  );
};
