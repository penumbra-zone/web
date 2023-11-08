import { metadata } from './content.ts';
import { useLocation } from 'react-router-dom';
import { PagePath } from './paths.ts';
import { Helmet } from 'react-helmet';

export const HeadTag = () => {
  const location = useLocation();
  const pathname = location.pathname as PagePath;

  return (
    <Helmet>
      <meta charSet='UTF-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <title>{metadata[pathname].title}</title>
      <meta name='description' content={metadata[pathname].description} />
    </Helmet>
  );
};
