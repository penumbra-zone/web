declare module '*.svg' {
  import type { FunctionComponent, SVGProps } from 'react';
  const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
  export default ReactComponent;
} 