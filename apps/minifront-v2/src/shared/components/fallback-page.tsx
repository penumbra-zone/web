import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Card } from '@penumbra-zone/ui/Card';
import { AlertTriangle } from 'lucide-react';

interface FallbackPageProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  errorDetails?: string;
}

export const FallbackPage = ({
  title,
  description,
  buttonText,
  onButtonClick,
  errorDetails,
}: FallbackPageProps) => {
  return (
    <div className="flex min-h-screen scale-125 flex-col items-center justify-center bg-[url('/assets/background/shield-background.svg')] bg-cover bg-center bg-no-repeat p-8 lg:scale-100">
      <div className='flex flex-col items-center justify-center md:hidden'>
        <div className='absolute top-0 left-0 z-5 w-full bg-caution-light'>
          <div className='flex items-center gap-3 px-6 py-3'>
            <AlertTriangle
              className='mt-0.5 h-6 w-6 shrink-0 text-caution-dark'
              aria-hidden='true'
            />
            <div className='flex flex-col gap-1 text-left'>
              <Text strong color='caution.dark'>
                Incompatible Device
              </Text>
              <Text small color='caution.dark'>
                For the best experience, we recommend using a desktop as your device.
              </Text>
            </div>
          </div>
        </div>
      </div>
      <div className='w-full max-w-xl'>
        <Card>
          <div className='flex flex-col items-center gap-3 p-3 text-center'>
            <Text h4 color='text.primary' align='center'>
              {title}
            </Text>
            <div className='max-w-sm'>
              <Text body color='text.primary' align='center'>
                {description}
              </Text>
            </div>
            {errorDetails && (
              <div className='text-text-error font-mono text-sm'>{errorDetails}</div>
            )}
            <div className='mt-4 flex w-full'>
              <Button
                actionType='accent'
                priority='primary'
                density='sparse'
                onClick={onButtonClick}
              >
                {buttonText}
              </Button>
            </div>
          </div>
        </Card>
        <div className='mt-4 flex px-3 lg:px-6'>
          <Text detail color='text.secondary' align='center'>
            Minifront is a minimal frontend for interacting with the Penumbra blockchain—embedded
            into every Penumbra RPC endpoint.
          </Text>
        </div>
      </div>
    </div>
  );
};
