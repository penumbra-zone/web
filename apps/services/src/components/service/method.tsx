import { FC, useState } from 'react';
import { MethodInfo, ServiceType } from '@bufbuild/protobuf';
import { Text } from '@repo/ui/Text';
import { Button } from '@repo/ui/Button';
import { penumbra } from '../../penumbra.ts';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export interface MethodProps {
  service: ServiceType;
  method: MethodInfo;
  name: string;
}

export const Method: FC<MethodProps> = ({ method, name, service }) => {
  const [parent] = useAutoAnimate();

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>();

  const onCall = async () => {
    if (!penumbra.connected) {
      return;
    }

    try {
      setLoading(true);

      const client = penumbra.service(service);
      const f = client[name];
      const res = await f?.({});

      if (typeof res === 'object' && typeof res[Symbol.asyncIterator] === 'function') {
        setResponse(JSON.stringify(await Array.fromAsync(res), null, 2));
      } else {
        setResponse(JSON.stringify(res, null, 2));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={parent} className='flex flex-col gap-4 border p-4'>
      <div className='flex items-center justify-between'>
        <Text xxl>{method.name}</Text>
        <div>
          <Button onClick={onCall}>Call</Button>
        </div>
      </div>
      {loading && <code>Loading...</code>}
      {!loading && response && <code className='max-h-40 max-w-full overflow-auto'>{response}</code>}
    </div>
  );
};
