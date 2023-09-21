import { useEffect, useState } from 'react';

interface StreamQueryResult<T> {
  data: T[];
  end: boolean;
  error: string | undefined;
}

export const useStreamQuery = <T>(query: AsyncIterable<T>): StreamQueryResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [end, setEnd] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const streamData = async () => {
      try {
        for await (const res of query) {
          setData(prevData => [...prevData, res]);
        }
        setEnd(true);
      } catch (e) {
        setError(String(e));
      }
    };

    void streamData();
  }, [query]);

  return { data, end, error };
};
