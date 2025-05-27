import { Link } from 'react-router-dom';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Home, ArrowLeft } from 'lucide-react';
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
          <Text detail color='text.muted'>
            Minifront v2 is currently under development. Some features from the original minifront
            are still being migrated.
          </Text>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Button onClick={() => window.history.back()} actionType='default' icon={ArrowLeft}>
            Go Back
          </Button>

          <Link to={PagePath.Portfolio}>
            <Button actionType='accent' icon={Home}>
              Go to Portfolio
            </Button>
          </Link>
        </div>

        {/* Available Routes */}
        <div className='pt-4 border-t border-other-tonalStroke'>
          <div className='mb-3'>
            <Text detail color='text.muted'>
              Available pages:
            </Text>
          </div>
          <div className='flex flex-wrap gap-2 justify-center'>
            <Link to={PagePath.Portfolio}>
              <Button actionType='default' density='compact'>
                Portfolio
              </Button>
            </Link>
            <Link to={PagePath.Transactions}>
              <Button actionType='default' density='compact'>
                Transactions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
