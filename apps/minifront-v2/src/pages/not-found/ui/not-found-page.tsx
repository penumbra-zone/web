import React from 'react';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { PagePath } from '@/shared/const/page';

export const NotFoundPage = (): React.ReactNode => {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center px-6'>
      <div className='max-w-md space-y-6 text-center'>
        {/* 404 Number */}
        <div className='space-y-2'>
          <div className='text-muted text-6xl font-bold md:text-8xl'>404</div>
          <Text h2>Page Not Found</Text>
        </div>

        {/* Description */}
        <div className='space-y-3'>
          <Text large color='text.muted'>
            The page you&apos;re looking for doesn&apos;t exist or hasn&apos;t been implemented yet.
          </Text>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col justify-center gap-3 sm:flex-row'>
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
