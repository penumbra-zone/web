import { observer } from 'mobx-react-lite';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
import { ExternalLink } from 'lucide-react';

export const TxViewer = observer(({ txInfo }: { txInfo?: TransactionInfo }) => {
  const txId = txInfo?.id && uint8ArrayToHex(txInfo.id.inner);
  const explorerUrl = txId ? `https://explorer.penumbra.zone/tx/${txId}` : null;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2 text-text-primary'>
        <Text strong>Transaction View</Text>
        {txId && <Text technical>{txId}</Text>}
      </div>

      <div className='flex flex-col gap-4 rounded-sm bg-other-tonal-fill5 p-6 text-text-secondary'>
        <Text>
          View this transaction on the Penumbra Explorer for detailed information including actions,
          memos, and parameters.
        </Text>

        {explorerUrl && (
          <div>
            <Button
              as='a'
              href={explorerUrl}
              target='_blank'
              rel='noopener noreferrer'
              priority='primary'
              iconOnly={false}
            >
              <ExternalLink className='mr-2 h-4 w-4' />
              View on Explorer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});
