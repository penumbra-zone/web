export type TransactionApiResponse =
  | {
      tx: string;
      height: number;
    }
  | { error: string };
