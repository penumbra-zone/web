import { Card, CardDescription, CardHeader, CardTitle } from '@penumbra-zone/ui/components/ui/card';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { RPC_ENDPOINTS } from '../../../shared/rpc-endpoints';
import { useMemo, useState } from 'react';
import { SelectList } from '@penumbra-zone/ui/components/ui/select-list';
import { Button } from '@penumbra-zone/ui/components/ui/button';

const randomSort = () => (Math.random() >= 0.5 ? 1 : -1);

export const SetRpcEndpoint = () => {
  const randomlySortedEndpoints = useMemo(() => [...RPC_ENDPOINTS].sort(randomSort), []);
  const [selectedEndpointUrl, setSelectedEndpointUrl] = useState(randomlySortedEndpoints[0]?.url);

  const handleSubmit = () => {};

  return (
    <FadeTransition>
      <Card className='w-[400px]' gradient>
        <CardHeader>
          <CardTitle>Select your preferred RPC endpoint</CardTitle>
          <CardDescription>
            If you&apos;re unsure which one to choose, leave this option set to the default.
          </CardDescription>
        </CardHeader>

        <form className='mt-6 flex flex-col gap-4'>
          <SelectList>
            {randomlySortedEndpoints.map(rpcEndpoint => (
              <SelectList.Option
                key={rpcEndpoint.url}
                label={rpcEndpoint.name}
                secondaryText={rpcEndpoint.url}
                onSelect={setSelectedEndpointUrl}
                value={rpcEndpoint.url}
                isSelected={rpcEndpoint.url === selectedEndpointUrl}
              />
            ))}
          </SelectList>

          <Button variant='gradient' className='mt-2' onClick={handleSubmit}>
            Next
          </Button>
        </form>

        <a
          href='https://github.com/penumbra-zone/web/blob/main/apps/extension/src/shared/rpc-endpoints.ts'
          target='_blank'
          rel='noreferrer'
          className='mt-6 block text-right text-xs text-muted-foreground'
        >
          Add to this list
        </a>
      </Card>
    </FadeTransition>
  );
};
