import { Plugin } from 'vite';
import { execSync } from 'child_process';

// Vite plugin used to inject the current commit hash + commit date + origin into React
// so the user can be informed the version of minifront they are using
export const commitInfoPlugin = (): Plugin => {
  const commitHash = execSync('git rev-parse HEAD').toString().trim();
  const commitDate = execSync('git log -1 --format=%cI').toString().trim();
  const gitOriginUrl = execSync('git remote get-url origin')
    .toString()
    .trim()
    .replace(/\.git$/, ''); // Origin urls often appended with .git

  return {
    name: 'vite-plugin-commit-info',
    enforce: 'pre',
    config() {
      return {
        // Inject the env variables into the code
        define: {
          __COMMIT_HASH__: JSON.stringify(commitHash),
          __COMMIT_DATE__: JSON.stringify(commitDate),
          __GIT_ORIGIN_URL__: JSON.stringify(gitOriginUrl),
        },
      };
    },
  };
};
