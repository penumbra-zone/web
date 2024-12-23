/* eslint-disable no-console -- disable console.log */
import { spawn } from 'child_process';

const child = spawn('node', ['scripts/link', 'unlink']);

child.stdout.on('data', data => {
  // eslint-disable-next-line no-undef -- disable no-undef
  console.log(data.toString());
});
