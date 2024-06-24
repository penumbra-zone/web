import { useLoaderData } from 'react-router-dom';
import { IndexLoaderResponse } from '../fetching/loader';
import { Card } from '@repo/ui/components/ui/card';
import { format } from 'date-fns';
import { SyncInfo as SyncInfoProto } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/util/tendermint_proxy/v1/tendermint_proxy_pb';

const getFormattedTime = (syncInfo: SyncInfoProto): { date?: string; time?: string } => {
  const dateObj = syncInfo.latestBlockTime?.toDate();
  if (!dateObj) return {};

  const date = format(dateObj, 'EEE MMM dd yyyy');
  const time = format(dateObj, "HH:mm:ss 'GMT'x");

  return { date, time };
};

export const SyncInfo = () => {
  const {
    status: { syncInfo },
    latestBlockHash,
    latestAppHash,
  } = useLoaderData() as IndexLoaderResponse;
  if (!syncInfo) return <></>;

  const { date, time } = getFormattedTime(syncInfo);

  return (
    <Card gradient className='flex flex-col gap-2 md:col-span-2'>
      <div className='flex justify-between gap-2'>
        <div className='flex flex-col gap-2'>
          <strong>Latest Block Height</strong>{' '}
          <span className='text-4xl font-bold'>{syncInfo.latestBlockHeight.toString()}</span>
        </div>
        <div className='flex flex-col items-center gap-2'>
          <strong>Caught Up</strong>{' '}
          {syncInfo.catchingUp ? (
            <div className='flex w-12 items-center justify-center rounded bg-red-700 p-1'>
              False
            </div>
          ) : (
            <div className='flex w-12 items-center justify-center rounded bg-green-700 p-1'>
              True
            </div>
          )}
        </div>
        <div className='flex flex-col'>
          <strong>Latest Block Time</strong>
          <span className='text-xl font-bold'>{date}</span>
          <span className='text-xl font-bold'>{time}</span>
        </div>
      </div>

      <div>
        <div>
          <strong>Latest Block Hash: </strong>
          <span className='break-all'>{latestBlockHash}</span>
        </div>
        <div>
          <strong>Latest App Hash: </strong>
          <span className='break-all'>{latestAppHash}</span>
        </div>
      </div>
    </Card>
  );
};
