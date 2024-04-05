import { format } from 'date-fns';

export const MinifrontVersion = () => {
  const shortenedCommitHash = __COMMIT_HASH__.slice(0, 7);
  const dateObj = new Date(__COMMIT_DATE__);
  const formattedDate = format(dateObj, "MMM dd yyyy HH:mm:ss 'GMT'x");
  return (
    <div>
      Version&nbsp;
      <a
        target='_blank'
        className='underline'
        href={`${__GIT_ORIGIN_URL__}/commits/${__COMMIT_HASH__}`}
        rel='noreferrer'
      >
        {shortenedCommitHash}
      </a>
      {' - '}
      {formattedDate}
    </div>
  );
};
