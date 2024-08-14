import { Banner } from '../banner';
import { getCompatability } from './get-compatability';

export const IncompatableBrowserBanner = (props: React.ComponentPropsWithoutRef<'div'>) => {
  const { isIncompatable, title, content } = getCompatability();

  return isIncompatable && <Banner type='error' title={title} content={content} {...props} />;
};
