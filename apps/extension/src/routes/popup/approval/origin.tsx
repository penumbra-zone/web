import { FadeTransition } from '@penumbra-zone/ui';
import { useStore } from '../../../state';
import { originApprovalSelector } from '../../../state/origin-approval';
import { ApproveDeny } from './approve-deny';
import { LinkGradientIcon } from '../../../icons';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export const OriginApproval = () => {
  const { requestOrigin, favIconUrl, title, setAttitude, sendResponse } =
    useStore(originApprovalSelector);

  const approve = () => {
    setAttitude(true);
    sendResponse();
    window.close();
  };

  const deny = () => {
    setAttitude(false);
    sendResponse();
    window.close();
  };

  if (!requestOrigin) return null;

  const originUrl = new URL(requestOrigin);
  if (originUrl.origin !== requestOrigin) throw new Error('Invalid origin');
  const { protocol, hostname, port } = originUrl;

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-6'>
        <h1 className='flex h-[70px] items-center justify-center border-b border-border-secondary font-headline text-xl font-semibold leading-[30px]'>
          Connect
        </h1>
        <div className='mx-auto size-20'>
          <LinkGradientIcon />
        </div>
        <div className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'>
          <div className='flex w-full flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <div className='flex h-11 w-full items-center rounded-lg border bg-background px-3 py-2 text-muted-foreground'>
                {favIconUrl ? <img src={favIconUrl} alt='icon' className='h-11' /> : null}
                <div className='p-2 font-headline text-base font-semibold'>
                  {title ? title : <div className='text-muted-foreground'>{'<no title>'}</div>}
                </div>
              </div>
              <div className='flex h-11 w-full items-center rounded-lg border bg-background px-3 py-2 text-muted-foreground'>
                <div className='p-2 font-mono'>
                  <span className='tracking-tighter'>
                    {protocol}
                    {'//'}
                  </span>
                  <span className='text-white'>{hostname}</span>
                  {port ? (
                    <span className='tracking-tighter'>
                      {':'}
                      <span className='text-white'>{port}</span>
                    </span>
                  ) : null}
                </div>
              </div>
              <div className='mt-3 flex flex-col gap-3'>
                <p className='text-muted-foreground'>This host wants to connect to your wallet.</p>
                <p className='flex items-center gap-2 text-rust'>
                  <ExclamationTriangleIcon />
                  Approval will allow this host to see your balance and transaction history.
                </p>
              </div>
            </div>
          </div>
        </div>
        <ApproveDeny approve={approve} deny={deny} wait={3} />
      </div>
    </FadeTransition>
  );
};
