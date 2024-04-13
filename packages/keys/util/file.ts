import fs from 'node:fs/promises';

export const fileExists = (filePath: string) =>
  fs.access(filePath, fs.constants.R_OK).then(
    () => true,
    () => false,
  );

export const dirExists = (dirPath: string) =>
  fs.readdir(dirPath).then(
    () => true,
    () => false,
  );
