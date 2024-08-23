import { Banner } from '../banner';
import { getCompatibility } from './get-compatibility';

export const IncompatibleBrowserBanner = (props: React.ComponentPropsWithoutRef<'div'>) => {
  const { isIncompatible, title, content } = getCompatibility();

  return isIncompatible && <Banner type='error' title={title} content={content} {...props} />;
};
