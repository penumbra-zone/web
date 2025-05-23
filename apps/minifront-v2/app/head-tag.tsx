import { Helmet } from 'react-helmet';

export const HeadTag = () => {
  return (
    <Helmet>
      <title>Penumbra</title>
      <meta charSet='UTF-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <meta name='description' content='Penumbra' />
    </Helmet>
  );
};
