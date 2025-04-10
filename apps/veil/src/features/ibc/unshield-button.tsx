import { useState } from 'react';
import { Button } from '@penumbra-zone/ui/Button';
import type { UnifiedAsset } from '@/pages/portfolio/api/use-unified-assets';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { InputToken } from './input-token';
import { InputBlock } from './input-block';
import { ChainSelector } from './chain-selector';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { Text } from '@penumbra-zone/ui/Text';

export function UnshieldButton({ asset }: { asset: UnifiedAsset }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selection, setSelection] = useState<UnifiedAsset | null>(asset);

  // Only enable button if there are shielded balances to withdraw
  const hasShieldedBalance = asset.shieldedBalances.length > 0;

  // Basic validation
  const validationErrors = {
    amountErr: amount !== '' && Number(amount) <= 0,
    exponentErr: false, // Would validate decimal places based on token metadata
    recipientErr: destinationAddress.length > 0 && destinationAddress.length < 10, // Simplified validation
    chainErr: !selectedChain,
  };

  // Placeholder for the actual withdrawal function
  const handleWithdraw = async () => {
    try {
      console.log('Withdrawal initiated', {
        asset: selection,
        amount,
        destinationChain: selectedChain,
        destinationAddress,
      });

      // Close dialog after successful withdrawal
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Withdrawal failed', error);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        disabled={!hasShieldedBalance}
        actionType='unshield'
        density='slim'
        priority='secondary'
      >
        Unshield
      </Button>

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <Dialog.Content title='Unshield Assets'>
          <div className='flex flex-col gap-4'>
            <Text color='text.primary'>Transfer assets from Penumbra to another blockchain</Text>

            <ChainSelector selectedChain={selectedChain} onChainSelect={setSelectedChain} />

            <InputToken
              label='Amount to send'
              placeholder='0.0'
              className='mb-1'
              selection={selection}
              setSelection={setSelection}
              value={amount}
              onInputChange={amount => {
                if (Number(amount) < 0) {
                  return;
                }
                setAmount(amount);
              }}
              validations={[
                {
                  type: 'error',
                  issue: 'insufficient funds',
                  checkFn: () => validationErrors.amountErr,
                },
                {
                  type: 'error',
                  issue: 'invalid decimal length',
                  checkFn: () => validationErrors.exponentErr,
                },
              ]}
              balances={[asset]}
            />

            <InputBlock
              label='Recipient on destination chain'
              className='mb-1'
              value={destinationAddress}
              validations={[
                {
                  type: 'error',
                  issue: 'address not valid',
                  checkFn: () => validationErrors.recipientErr,
                },
              ]}
            >
              <TextInput
                placeholder='Enter the address'
                value={destinationAddress}
                onChange={setDestinationAddress}
              />
            </InputBlock>

            <Button
              actionType='unshield'
              disabled={
                !Number(amount) ||
                !destinationAddress ||
                !!Object.values(validationErrors).find(Boolean) ||
                !selection
              }
              onClick={() => void handleWithdraw()}
            >
              Unshield Assets
            </Button>
          </div>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
