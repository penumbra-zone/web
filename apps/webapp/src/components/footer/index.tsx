/* eslint-disable @typescript-eslint/dot-notation */
export const Footer = () => {
  const dirty = GIT_DESCRIBE.endsWith('-dirty');
  const commitHref = new URL('/tree/' + GIT_DESCRIBE.split('-dirty')[0], GIT_ORIGIN).href;

  return (
    <div className='my-4 flex justify-center'>
      <div className='flex flex-col text-center text-stone-700'>
        <div className='font-bold'>{import.meta.env['VITE_MINIFRONT_LABEL']}</div>
        <div>
          <a
            target='_blank'
            className={dirty ? 'text-red-500' : 'underline'}
            href={commitHref}
            rel='noreferrer'
          >
            {GIT_DESCRIBE}
          </a>
          {' - '}
          {BUILD_DATE}
        </div>
      </div>
    </div>
  );
};
