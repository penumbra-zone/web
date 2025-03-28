import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';

interface ErrorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ErrorDetailsModal({ isOpen, onClose }: ErrorDetailsModalProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <Dialog.Content title='Error details'>
        <div className='flex flex-col gap-4'>
          <Text color='text.primary'>An error occurred when loading data from the blockchain</Text>

          <Text color='text.secondary'>
            We encountered an issue while attempting to load data from the blockchain. This error
            can occur due to various factors, such as:
          </Text>

          <ul className='list-disc pl-6 flex flex-col gap-2 [&>li]:marker:text-text-secondary'>
            <li>
              <Text color='text.secondary'>
                Network Congestion: High traffic on the blockchain network may delay data retrieval.
              </Text>
            </li>
            <li>
              <Text color='text.secondary'>
                Node Sync Delay: Our data provider nodes might be temporarily out of sync with the
                blockchain, causing discrepancies.
              </Text>
            </li>
            <li>
              <Text color='text.secondary'>
                Connectivity Issues: A weak or unstable internet connection can disrupt data
                transmission.
              </Text>
            </li>
          </ul>

          <div className='mt-4'>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
