import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Button } from '@penumbra-zone/ui/Button';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { Text } from '@penumbra-zone/ui/Text';
import { Card } from '@penumbra-zone/ui/Card';
import { LockOpen2Icon } from '@radix-ui/react-icons';

import { ChainSelector } from './chain-selector';
import { InputToken } from './input-token';
import { InputBlock } from './input-block';

// This would come from a store or hook in the actual implementation
interface Asset {
  symbol: string;
  displayDenom?: string;
  balance?: string;
  metadata: {
    display: string;
    base: string;
    symbol: string;
  };
}

interface IbcWithdrawalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAsset?: Asset;
  assets: Asset[];
}

export const IbcWithdrawalDialog = observer(
  ({ isOpen, onClose, preselectedAsset, assets }: IbcWithdrawalDialogProps) => {
    // State management
    const [selectedChain, setSelectedChain] = useState<string>('');
    const [destinationAddress, setDestinationAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [selection, setSelection] = useState<Asset | null>(preselectedAsset ?? null);

    // Reset form when opening with a preselected asset
    useEffect(() => {
      if (isOpen && preselectedAsset) {
        setSelection(preselectedAsset);
      }
    }, [isOpen, preselectedAsset]);

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

        // After successful withdrawal
        onClose();
      } catch (error) {
        console.error('Withdrawal failed', error);
      }
    };

    return (
      <Dialog isOpen={isOpen} onClose={onClose}>
        <Dialog.Content title='Unshield Assets'>
          <Text color='text.primary'>Transfer assets from Penumbra to another blockchain</Text>

          <Card>
            <form
              className='flex flex-col gap-4 p-4'
              onSubmit={e => {
                e.preventDefault();
                void handleWithdraw();
              }}
            >
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
                balances={assets}
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
                type='submit'
                disabled={
                  !Number(amount) ||
                  !destinationAddress ||
                  !!Object.values(validationErrors).find(Boolean) ||
                  !selection
                }
                className='flex items-center gap-2'
                actionType='unshield'
              >
                <LockOpen2Icon />
                <span>Unshield Assets</span>
              </Button>
            </form>
          </Card>
        </Dialog.Content>
      </Dialog>
    );
  },
);
