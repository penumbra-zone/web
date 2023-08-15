import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@ui/lib/utils';
import { Logo, logoVariants } from '@ui/components/';
import RayCompressed from './ray-compressed.mp4';

export interface VideoLogoProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof logoVariants> {
  noWords?: boolean;
}

const CompressedVideoLogo = React.forwardRef<HTMLDivElement, VideoLogoProps>((props, ref) => {
  return <VideoLogo {...props} videoSrc={RayCompressed} ref={ref} />;
});

CompressedVideoLogo.displayName = 'CompressedVideoLogo';

export interface InnerVidProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof logoVariants> {
  videoSrc: string;
  noWords?: boolean;
}

const VideoLogo = React.forwardRef<HTMLDivElement, InnerVidProps>(
  ({ className, size, noWords, videoSrc, ...props }, ref) => {
    return (
      <div className={cn(logoVariants({ size, className }), 'relative')} ref={ref} {...props}>
        {noWords ? null : <Logo onlyWords={!noWords} className='absolute z-10' />}
        <video autoPlay loop playsInline className='absolute z-0 w-[70%]'>
          <source src={videoSrc} type='video/mp4' />
        </video>
      </div>
    );
  },
);

export { VideoLogo, CompressedVideoLogo };
