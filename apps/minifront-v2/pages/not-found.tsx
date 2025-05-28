import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { PagePath } from '@shared/const/page';

export const NotFoundPage = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-6'>
      <div className='max-w-md text-center space-y-6'>
        {/* 404 Number */}
        <div className='space-y-2'>
          <div className='text-6xl md:text-8xl font-bold text-text-muted'>404</div>
          <Text h2>Page Not Found</Text>
        </div>

        {/* Description */}
        <div className='space-y-3'>
          <Text large color='text.muted'>
            The page you're looking for doesn't exist or hasn't been implemented yet.
          </Text>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Button onClick={() => window.history.back()} actionType='default'>
            Go Back
          </Button>

          <Button actionType='accent' onClick={() => window.location.assign(PagePath.Portfolio)}>
            Go to Portfolio
          </Button>
        </div>
      </div>
    </div>
  );
};
