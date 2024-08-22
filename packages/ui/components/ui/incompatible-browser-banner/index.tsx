import { Banner } from '../banner';
<<<<<<< HEAD
import { getCompatibility } from './get-compatibility';

export const IncompatibleBrowserBanner = (props: React.ComponentPropsWithoutRef<'div'>) => {
  const { isIncompatible, title, content } = getCompatibility();
=======
import { getCompatability } from './get-compatibility';

export const IncompatibleBrowserBanner = (props: React.ComponentPropsWithoutRef<'div'>) => {
  const { isIncompatible, title, content } = getCompatability();
>>>>>>> 1f6ec195 (Rename files)

  return isIncompatible && <Banner type='error' title={title} content={content} {...props} />;
};
