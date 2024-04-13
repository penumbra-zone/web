import path from 'node:path';
import { cmd } from './cmd';
import { dirExists } from './file';

export const checkoutKeys = async (
  gitRepo: string,
  clonePath: string,
  gitTag: string,
  gitPathSpec: string,
) => {
  if (await dirExists(path.join(clonePath, '.git')))
    cmd('git', ['fetch', ...['--depth', '1'], 'origin', 'tag', gitTag], { cwd: clonePath });
  else
    cmd('git', [
      'lfs',
      'clone',
      '--no-checkout',
      ...['--branch', gitTag],
      ...['--depth', '1'],
      gitRepo,
      clonePath,
    ]);
  await cmd('git', ['checkout', gitTag, gitPathSpec], { cwd: clonePath });
};
