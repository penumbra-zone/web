import { useEffect, useState } from 'react';

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
