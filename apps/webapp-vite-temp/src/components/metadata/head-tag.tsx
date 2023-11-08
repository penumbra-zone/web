import { metadata } from './content.ts';
import { Helmet } from 'react-helmet';
import { usePagePath } from '../../hooks/usePagePath.ts';

export const HeadTag = () => {
  const pathname = usePagePath();

  return (
    <Helmet>
      <meta charSet='UTF-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <title>{metadata[pathname].title}</title>
      <meta name='description' content={metadata[pathname].description} />
    </Helmet>
  );
};
