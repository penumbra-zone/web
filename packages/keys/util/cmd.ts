import { spawn, type CommonSpawnOptions } from 'child_process';
import { stderr as console } from './io';

export const cmd = (bin: string, args: string[], opt?: CommonSpawnOptions) => {
  const child = spawn(bin, args, { stdio: 'inherit', ...opt });
  const promise = new Promise<void>((resolve, reject) => {
    child
      .on('spawn', () => console.log(bin, ...args))
      .on('error', reject)
      .on('exit', (code, signal) => {
        if (code) process.exit(code);
        if (signal) process.kill(process.pid, signal);
        resolve();
      });
  });
  return Object.assign(promise, { child });
};
