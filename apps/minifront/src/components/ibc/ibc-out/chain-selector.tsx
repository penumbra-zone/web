import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@penumbra-zone/ui-old/components/ui/select';
import { cn } from '@penumbra-zone/ui-old/lib/utils';
import { AllSlices } from '../../../state';
import { Chain } from '@penumbra-labs/registry';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { useChains } from '../../../state/ibc-out';

const chainSelectorSelector = (state: AllSlices) => ({
  chain: state.ibcOut.chain,
  setChain: state.ibcOut.setChain,
});

export const ChainSelector = () => {
  const { chain, setChain } = useStoreShallow(chainSelectorSelector);
  const chains = useChains();

  return (
    <div className='flex flex-col gap-3 rounded-lg border bg-background px-4 pb-5 pt-3'>
      <p className='text-base font-bold'>Chain</p>
      <Select
        value={chain?.displayName ?? ''}
        onValueChange={v => setChain(chains.data?.find(i => i.displayName === v))}
      >
        <SelectTrigger className='border-none'>
          <SelectValue placeholder='Select chain'>
            {chain && (
              <div className='flex gap-2'>
                <ChainIcon chain={chain} />
                <p className='mt-[2px] text-muted-foreground'>{chain.displayName}</p>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {chains.data?.map((i, index) => (
            <SelectItem
              key={index}
              value={i.displayName}
              className={cn(
                'hover:bg-brown',
                chain?.displayName === i.displayName && 'bg-charcoal-secondary',
              )}
            >
              <div className='flex gap-2'>
                <ChainIcon chain={i} />
                <p className='mt-[2px]'>{i.displayName}</p>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const ChainIcon = ({ chain }: { chain: Chain }) => {
  const imgUrl = getChainImgUrl(chain);
  if (!imgUrl) {
    return undefined;
  }

  return <img src={imgUrl} alt='Chain' className='size-5' />;
};

const getChainImgUrl = (chain?: Chain) => {
  const chainImgObj = chain?.images[0];
  if (!chainImgObj) {
    return undefined;
  }

  return chainImgObj.png ?? chainImgObj.svg;
};
