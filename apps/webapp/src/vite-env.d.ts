/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MINIFRONT_LABEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const BUILD_DATE: string;
declare const GIT_ORIGIN: string;
declare const GIT_DESCRIBE: string;
declare const GIT_DESCRIBE_ALWAYS: string;
