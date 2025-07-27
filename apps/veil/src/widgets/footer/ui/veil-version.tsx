'use client';

import { format } from 'date-fns';

export const VeilVersion = () => {
  const commitHash = process.env.COMMIT_HASH || 'unknown';
  const commitDate = process.env.COMMIT_DATE || 'unknown';
  const gitOriginUrl = process.env.GIT_ORIGIN_URL || 'unknown';

  const shortHash = commitHash.substring(0, 7);
  const formattedDate =
    commitDate !== 'unknown'
      ? format(new Date(commitDate), "MMM dd yyyy HH:mm:ss 'GMT'x")
      : 'unknown';

  const commitUrl = gitOriginUrl !== 'unknown' ? `${gitOriginUrl}/commit/${commitHash}` : '#';

  return (
    <div className='text-xs text-text-secondary opacity-50'>
      <a href={commitUrl} target='_blank' rel='noopener noreferrer' className='hover:underline'>
        {shortHash}
      </a>
      {' • '}
      {formattedDate}
    </div>
  );
};
