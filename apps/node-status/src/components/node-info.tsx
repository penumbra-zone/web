import { useLoaderData } from 'react-router-dom';
import { Card } from '@penumbra-zone/ui/components/ui/card';
import { Identicon } from '@penumbra-zone/ui/components/ui/identicon';
import { IndexLoaderResponse } from '../fetching/loader';
import { uint8ArrayToString } from '@penumbra-zone/types/src/string';

export const NodeInfo = () => {
  const {
    status: { nodeInfo },
  } = useLoaderData() as IndexLoaderResponse;
  if (!nodeInfo) return <></>;

  return (
    <Card gradient className='flex flex-col gap-1'>
      <div className='mb-2 flex flex-col gap-1'>
        <strong>Network</strong>
        <div className='flex items-center gap-2'>
          <Identicon uniqueIdentifier={nodeInfo.network} type='gradient' size={14} />
          <span className='text-2xl font-bold'>{nodeInfo.network}</span>
        </div>
        <strong>Version</strong>
        <span className='text-2xl font-bold'>{nodeInfo.version}</span>
      </div>
      <div className='flex flex-col'>
        <strong>Default Node ID</strong>
        <span className='ml-2'>{nodeInfo.defaultNodeId}</span>
      </div>
      {nodeInfo.protocolVersion && (
        <div className='flex flex-col'>
          <strong>Protocol Version</strong>
          <span className='ml-2'>Block: {nodeInfo.protocolVersion.block.toString()}</span>
          <span className='ml-2'>P2P: {nodeInfo.protocolVersion.p2p.toString()}</span>
          <span className='ml-2'>App: {nodeInfo.protocolVersion.app.toString()}</span>
        </div>
      )}
      <div className='flex flex-col'>
        <strong>Listen Address</strong>
        <span className='ml-2'>{nodeInfo.listenAddr}</span>
      </div>
      <div className='flex flex-col'>
        <strong>Channels</strong>
        <span className='ml-2'>{uint8ArrayToString(nodeInfo.channels)}</span>
      </div>
      <div className='flex flex-col'>
        <strong>Moniker</strong>
        <span className='ml-2'>{nodeInfo.moniker}</span>
      </div>
      {nodeInfo.other && (
        <div className='flex flex-col'>
          <strong>Transaction Index</strong>
          <span className='ml-2'>{nodeInfo.other.txIndex}</span>
          <strong>RPC Address</strong>
          <span className='ml-2'>{nodeInfo.other.rpcAddress}</span>
        </div>
      )}
    </Card>
  );
};
