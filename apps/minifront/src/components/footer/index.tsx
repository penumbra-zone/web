import { format } from 'date-fns';

export const Footer = () => {
  const shortenedCommitHash = __COMMIT_HASH__.slice(0, 7);
  const dateObj = new Date(__COMMIT_DATE__);
  const formattedDate = format(dateObj, "MMM dd yyyy HH:mm:ss 'GMT'x");

  return (
    <div className='py-4 flex justify-center bg-background'>
      <div className='flex flex-col text-center text-stone-700'>
        <div className='font-bold'>This software runs entirely on your device.</div>
        <div>
          <a
            target='_blank'
            rel='noreferrer'
            className='underline'
            href='https://www.coincenter.org/electronic-cash-decentralized-exchange-and-the-constitution/'
          >
            Learn more
          </a>{' '}
          about your rights.
        </div>
        <div>
          Version&nbsp;
          <a
            target='_blank'
            className='underline'
            href={`${__GIT_ORIGIN_URL__}/commits/${__COMMIT_HASH__}`}
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
