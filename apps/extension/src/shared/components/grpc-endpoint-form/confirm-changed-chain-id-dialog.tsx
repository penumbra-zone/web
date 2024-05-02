import { Button } from '@penumbra-zone/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from '@penumbra-zone/ui/components/ui/dialog';

export const ConfirmChangedChainIdDialog = ({
  chainId,
  originalChainId,
  promiseWithResolvers,
}: {
  chainId?: string;
  originalChainId?: string;
  promiseWithResolvers?: PromiseWithResolvers<void>;
}) => {
  return (
    <Dialog open={!!promiseWithResolvers} onOpenChange={promiseWithResolvers?.reject}>
      <DialogContent>
        <DialogHeader>Chain ID changed</DialogHeader>
        <DialogDescription>
          <div className='flex flex-col gap-4 px-[30px] pb-[30px]'>
            <p>
              The originally selected gRPC endpoint was serving chain ID{' '}
              <span className='font-mono text-rust'>{originalChainId}</span>. But the gRPC endpoint
              you&apos;ve selected now serves chain ID{' '}
              <span className='font-mono text-rust'>{chainId}</span>. Was this intentional?
            </p>

            <div className='flex flex-col gap-2'>
              <Button onClick={() => promiseWithResolvers?.resolve()} variant='gradient'>
                Yes; proceed
              </Button>

              <Button onClick={promiseWithResolvers?.reject} variant='secondary'>
                No; cancel
              </Button>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
