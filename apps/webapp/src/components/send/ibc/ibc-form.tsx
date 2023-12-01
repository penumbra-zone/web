import { Button } from '@penumbra-zone/ui';
import { useToast } from '@penumbra-zone/ui/components/ui/use-toast.ts';
import { useStore } from '../../../state';
import { ibcSelector } from '../../../state/ibc.ts';
import { ChainSelector } from './chain-selector.tsx';
import { InputBlock } from '../../shared/input-block.tsx';

// TODO: Re-implementing ibc form, see send form
export default function IbcForm() {
  const { toast } = useToast();
  const { sendIbcWithdraw, destinationChainAddress, setDestinationChainAddress } =
    useStore(ibcSelector);

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <ChainSelector />
      <InputBlock
        label='Recipient on destination chain'
        placeholder='Enter the address'
        className='mb-1'
        value={destinationChainAddress ?? ''}
        onChange={e => setDestinationChainAddress(e.target.value)}
        validations={[]}
      />
      <Button
        type='submit'
        variant='gradient'
        className='mt-9'
        disabled={false}
        onClick={() => void sendIbcWithdraw(toast)}
      >
        Send
      </Button>
    </form>
  );
}
