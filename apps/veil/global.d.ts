declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.svg' {
  import { FC, SVGAttributes } from 'react';
  const value: FC<SVGAttributes<SVGElement>>;
  export default value;
}

declare module '*.ttf' {
  const src: string;
  export default src;
}

declare module '*.ttc' {
  const src: string;
  export default src;
}
