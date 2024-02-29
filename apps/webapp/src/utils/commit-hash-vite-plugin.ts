import { Plugin } from 'vite';
import { execSync } from 'child_process';
import { appendFileSync, existsSync, readFileSync } from 'fs';

const PATH_TO_DECLARATION_FILE = 'src/vite-env.d.ts';
const COMMIT_VAR_DECLARATION = `declare const __COMMIT_HASH__: string;\n`;
const COMMIT_DATE_DECLARATION = `declare const __COMMIT_DATE__: string;\n`;

// Vite plugin used to inject the current commit hash + commit date into React
// so the user can be informed the version of minifront they are using
export const commitHashPlugin = (): Plugin => {
  const commitHash = execSync('git rev-parse HEAD').toString().trim();
  const commitDate = execSync('git log -1 --format=%cI').toString().trim();

  return {
    name: 'vite-plugin-commit-hash',
    enforce: 'pre',
    configResolved() {
      if (!existsSync(PATH_TO_DECLARATION_FILE))
        throw new Error(`${PATH_TO_DECLARATION_FILE} does not exist`);

      const fileContents = readFileSync(PATH_TO_DECLARATION_FILE, { encoding: 'utf8' });

      // Append the declaration if it's not present
      if (!fileContents.includes(COMMIT_VAR_DECLARATION)) {
        appendFileSync(PATH_TO_DECLARATION_FILE, COMMIT_VAR_DECLARATION, { encoding: 'utf8' });
      }

      // Append the date declaration if it's not present
      if (!fileContents.includes(COMMIT_DATE_DECLARATION)) {
        appendFileSync(PATH_TO_DECLARATION_FILE, COMMIT_DATE_DECLARATION, { encoding: 'utf8' });
      }
    },
    config() {
      // Inject the env variables into the code
      return {
        define: {
          __COMMIT_HASH__: JSON.stringify(commitHash),
          __COMMIT_DATE__: JSON.stringify(commitDate),
        },
      };
    },
  };
};
