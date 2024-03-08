import { FadeTransition } from '@penumbra-zone/ui';
import { useStore } from '../../../state';
import { originApprovalSelector } from '../../../state/origin-approval';
import { ApproveDeny } from './approve-deny';
import { LinkGradientIcon } from '../../../icons';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';
import { DisplayOriginURL } from '../../../shared/components/display-origin-url';
import { cn } from '@penumbra-zone/ui/lib/utils';

export const OriginApproval = () => {
  const { requestOrigin, favIconUrl, title, lastRequest, setChoice, sendResponse } =
    useStore(originApprovalSelector);

  const approve = () => {
    setChoice(UserChoice.Approved);
    sendResponse();
    window.close();
  };

  const deny = () => {
    setChoice(UserChoice.Denied);
    sendResponse();
    window.close();
  };

  const ignore = () => {
    setChoice(UserChoice.Ignored);
    sendResponse();
    window.close();
  };

  if (!requestOrigin) return null;

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-6'>
        <h1 className='flex h-[70px] items-center justify-center border-b border-border-secondary font-headline text-xl font-semibold leading-[30px]'>
          Connect
        </h1>
        <div className='mx-auto size-20'>
          <LinkGradientIcon />
        </div>
        <div className='w-full px-[30px]'>
          <div className='flex flex-col gap-2'>
            <div
              className={cn(
                'rounded-[1em]',
                'border-[1px]',
                'border-transparent',
                'p-2',
                '[background:linear-gradient(var(--charcoal),var(--charcoal))_padding-box,_linear-gradient(to_bottom_left,rgb(139,228,217),rgb(255,144,47))_border-box]',
              )}
            >
              <div className='flex flex-col gap-2'>
                <div className='flex h-11 w-full items-center rounded-lg border bg-background px-3 py-2 text-muted-foreground'>
                  {favIconUrl ? (
                    <div
                      className={cn(
                        'rounded-[1em]',
                        'border-[1px]',
                        'border-transparent',
                        '[background:linear-gradient(var(--charcoal),var(--charcoal))_padding-box,_linear-gradient(to_top_right,rgb(139,228,217),rgb(255,144,47))_border-box]',
                      )}
                    >
                      <img src={favIconUrl} alt='website icon' className='h-20 rounded-[1em]' />
                    </div>
                  ) : null}
                  <div className='p-2 font-headline text-base font-semibold text-white'>
                    {title ? title : <div className='text-muted-foreground'>{'<no title>'}</div>}
                  </div>
                </div>
                <div className='z-30 flex h-11 w-full items-center rounded-lg border bg-background px-3 py-2 text-muted-foreground'>
                  <div className='w-full p-2 text-center'>
                    <DisplayOriginURL url={new URL(requestOrigin)} />
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-3 flex flex-col gap-3'>
              <div className='text-center text-muted-foreground'>
                This host wants to connect to your wallet.
              </div>
              <div className='flex items-center gap-2 text-rust'>
                <ExclamationTriangleIcon />
                Approval will allow this host to see your balance and transaction history.
              </div>
            </div>
          </div>
        </div>
        <ApproveDeny approve={approve} deny={deny} ignore={lastRequest && ignore} wait={3} />
      </div>
    </FadeTransition>
  );
};
