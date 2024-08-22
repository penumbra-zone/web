import { Banner } from '../banner';
import { getCompatability } from './get-compatability';

export const IncompatibleBrowserBanner = (props: React.ComponentPropsWithoutRef<'div'>) => {
  const { isIncompatible, title, content } = getCompatability();

  return isIncompatible && <Banner type='error' title={title} content={content} {...props} />;
};
