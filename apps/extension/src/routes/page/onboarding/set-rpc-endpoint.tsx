import { Card, CardDescription, CardHeader, CardTitle } from '@penumbra-zone/ui/components/ui/card';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { RPC_ENDPOINTS } from '../../../shared/rpc-endpoints';
import { useMemo, useState } from 'react';
import { SelectList } from '@penumbra-zone/ui/components/ui/select-list';

const randomSort = () => (Math.random() >= 0.5 ? 1 : -1);

export const SetRpcEndpoint = () => {
  const randomlySortedEndpoints = useMemo(() => [...RPC_ENDPOINTS].sort(randomSort), []);
  const [selectedEndpointUrl, setSelectedEndpointUrl] = useState(randomlySortedEndpoints[0]?.url);

  return (
    <FadeTransition>
      <Card className='w-[400px]' gradient>
        <CardHeader>
          <CardTitle>Select your preferred RPC endpoint</CardTitle>
          <CardDescription>
            If you&apos;re unsure which one to choose, leave this option set to the default.
          </CardDescription>
        </CardHeader>

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
      </Card>
    </FadeTransition>
  );
};
