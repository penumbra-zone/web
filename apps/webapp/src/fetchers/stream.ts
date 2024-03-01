import { useEffect, useState } from 'react';
import Array from '@penumbra-zone/polyfills/Array.fromAsync';

interface StreamQueryResult<T> {
  data: T | undefined;
  end: boolean;
  error: unknown;
}

interface CollectedStreamQueryResult<T> {
  data: T[];
  end: boolean;
  error: unknown;
}

type DataHandler<T, U> = (prevData: U, newData: T) => U;

// Common hook for handling streams
const useStreamCommon = <T, U>(
  query: AsyncIterable<T>,
  initialData: U,
  dataHandler: DataHandler<T, U>,
): { data: U; end: boolean; error: unknown } => {
  const [data, setData] = useState<U>(initialData);
  const [end, setEnd] = useState(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    const streamData = async () => {
      try {
        for await (const res of query) {
          setData(prevData => dataHandler(prevData, res));
        }
        setEnd(true);
      } catch (e) {
        setError(e);
      }
    };

    void streamData();
  }, [query, dataHandler]);

  return { data, end, error };
};

// Every new stream result will replace the old value
export const useStream = <T>(query: AsyncIterable<T>): StreamQueryResult<T> => {
  return useStreamCommon(query, undefined as T | undefined, (_, newData) => newData);
};

// Will take every stream result and append it to an array. Will ever grow until stream finished.
export const useCollectedStream = <T>(query: AsyncIterable<T>): CollectedStreamQueryResult<T> => {
  return useStreamCommon(query, [] as T[], (prevData, newData) => [...prevData, newData]);
};

/*
// Meant to convert a stream into a promise of the completed result
// Note: If the stream is unending, this will not resolve.
//       This is only useful if you are collecting all of the fixed set of results together.
export const streamToPromise = <T>(query: AsyncIterable<T>): Promise<T[]> => {
  return new Promise<T[]>((resolve, reject) => {
    void (async function () {
      const result: T[] = [];
      try {
        for await (const res of query) {
          result.push(res);
        }
        resolve(result);
      } catch (e) {
        if (e instanceof Error) reject(e);
        else if (typeof e === 'string') reject(new Error(e));
        else reject(new Error('Unknown error in `streamToPromise`'));
      }
    })();
  });
};
*/

// eslint-disable-next-line @typescript-eslint/unbound-method
export const streamToPromise = Array.fromAsync;
