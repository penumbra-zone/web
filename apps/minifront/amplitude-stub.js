/* eslint-disable -- js stub */

const noop = () => void null;
const stubLog = (stubName, parameters) => console.debug('stub', stubName, parameters);

export const init = globalThis.__DEV__ ? (...p) => stubLog('init', p) : noop;
export const track = globalThis.__DEV__ ? (...p) => stubLog('track', p) : noop;
export const setUserId = globalThis.__DEV__ ? (...p) => stubLog('setUserId', p) : noop;
