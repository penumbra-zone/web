import { Console } from 'node:console';

export const stdout = new Console(process.stdout);
export const stderr = new Console(process.stderr);
