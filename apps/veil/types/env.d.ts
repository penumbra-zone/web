declare namespace NodeJS {
  interface ProcessEnv {
    COMMIT_HASH: string;
    COMMIT_DATE: string;
    GIT_ORIGIN_URL: string;
  }
}
