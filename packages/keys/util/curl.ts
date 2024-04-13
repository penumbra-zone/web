import { cmd } from './cmd';

export const curlKeys = async (
  keyFiles: string[],
  baseUrl: string,
  outDir: string,
  clobber = baseUrl.startsWith('file://'),
) => {
  const keyFileGlob = '{' + keyFiles.join(',') + '}';
  const keysUrl = baseUrl + '/' + keyFileGlob;
  await cmd('curl', [
    '--parallel',
    '--create-dirs',
    ...['--output-dir', outDir],
    ...(clobber
      ? ['--clobber'] // overwrite existing
      : ['--continue-at', '-']), // resume or skip existing
    '--location', // follow redirects
    '--remote-name', // automatic file name
    keysUrl,
  ]);
};
