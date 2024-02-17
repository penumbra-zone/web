import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import RayCompressed from './ray-compressed.mp4';
import { Logo, logoVariants } from './static';
import { cn } from '../../../lib/utils';

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
        <video autoPlay loop playsInline muted className='absolute z-0 w-[70%]'>
          <source src={videoSrc} type='video/mp4' />
        </video>
      </div>
    );
  },
);

VideoLogo.displayName = 'VideoLogo';

export { VideoLogo, CompressedVideoLogo };
