import * as React from 'react';
import RayHd from './ray-hd.mp4';
import { VideoLogo, VideoLogoProps } from '@ui/components';

// Segmented out (instead of a prop) so that the extension does not bundle these together
// and end up packaging both the hd and compressed video.
const HdVideoLogo = React.forwardRef<HTMLDivElement, VideoLogoProps>((props, ref) => {
  return <VideoLogo {...props} videoSrc={RayHd} ref={ref} />;
});

HdVideoLogo.displayName = 'HdVideoLogo';

export { HdVideoLogo };
