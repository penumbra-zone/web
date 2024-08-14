import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { IncompatableBrowserBanner } from '../incompatable-browser-banner';
import { FadeTransition } from '../fade-transition';
import { AnimatedPenumbra } from '../logo/animated-penumbra';

export const SplashPage = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) => {
  return (
    <FadeTransition>
      <IncompatableBrowserBanner className='!absolute inset-x-0 top-0' />
      <div className='flex min-h-screen flex-col items-center justify-center'>
        <div className='absolute inset-0 z-[-1] flex w-screen items-center justify-center'>
          <AnimatedPenumbra className='w-[calc(100%-25vw)]' />
        </div>
        <div className='px-4'>
          <Card className='w-full max-w-[608px]' gradient>
            <CardHeader className='items-start'>
              <CardTitle className='bg-text-linear bg-clip-text text-[40px] font-bold leading-9 text-transparent opacity-80'>
                {title}
              </CardTitle>
            </CardHeader>
            {description && <CardDescription>{description}</CardDescription>}
            <CardContent className='mt-4'>{children}</CardContent>
          </Card>
        </div>
      </div>
    </FadeTransition>
  );
};
