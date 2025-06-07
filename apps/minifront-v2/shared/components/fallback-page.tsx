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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[url('/assets/background/shield-background.svg')] lg:scale-100 scale-125 bg-cover bg-center bg-no-repeat ">
      <div className='md:hidden flex flex-col items-center justify-center'>
        <div className='absolute top-0 left-0 w-full z-5 bg-caution-light'>
          <div className='flex items-center gap-3 px-6 py-3'>
            <AlertTriangle
              className='w-6 h-6 mt-0.5 flex-shrink-0 text-caution-dark'
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
      <div className='max-w-xl w-full'>
        <Card>
          <div className='flex flex-col items-center text-center gap-3 p-3'>
            <Text h4 color='text.primary' align='center'>
              {title}
            </Text>
            <div className='max-w-sm'>
              <Text body color='text.primary' align='center'>
                {description}
              </Text>
            </div>
            {errorDetails && (
              <div className='text-sm text-text-error font-mono'>{errorDetails}</div>
            )}
            <div className='flex w-full mt-4'>
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
        <div className='flex px-3 lg:px-6 mt-4'>
          <Text detail color='text.secondary' align='center'>
            Minifront is a minimal frontend for interacting with the Penumbra blockchain—embedded
            into every Penumbra RPC endpoint.
          </Text>
        </div>
      </div>
    </div>
  );
};
