import { metadata } from './content';
import { Helmet } from 'react-helmet';
import { usePagePath } from '../../fetchers/page-path';

export const HeadTag = () => {
  const pathname = usePagePath();

  return (
    <Helmet>
      <meta charSet='UTF-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <title>{['Penumbra', metadata[pathname].title].filter(a => a).join(' | ')}</title>
      <meta name='description' content={metadata[pathname].description} />
    </Helmet>
  );
};
