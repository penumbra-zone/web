import { format } from 'date-fns';

const REPO_URL = 'https://github.com/penumbra-zone/web';

export const Footer = () => {
  const shortenedCommitHash = __COMMIT_HASH__.slice(0, 7);
  const dateObj = new Date(__COMMIT_DATE__);
  const formattedDate = format(dateObj, "MMM dd yyyy HH:mm:ss 'GMT'x");

  return (
    <div className='my-4 flex justify-center'>
      <div className='flex flex-col text-center text-stone-700'>
        <div className='font-bold'>Frontend app version</div>
        <div>
          <a
            target='_blank'
            className='underline'
            href={`${REPO_URL}/commits/${__COMMIT_HASH__}`}
            rel='noreferrer'
          >
            {shortenedCommitHash}
          </a>{' '}
          - {formattedDate}
        </div>
      </div>
    </div>
  );
};
