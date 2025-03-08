import { isDisconnectedPortError } from './chrome-errors.js';

/**
 * Suppress errors thrown by a disconnected port, when you don't care.
 *
 * Use in a try-catch block:
 *
 * ```ts
 * try { aaa() } catch (e) { suppressDisconnectedPortError(e) }
 * ```
 *
 * Or as a promise catch handler:
 *
 * ```ts
 * await ooo.catch(suppressDisconnectedPortError)
 * ```
 *
 * @param reason something you caught
 * @throws any input other than a disconnected port error
 */
export const suppressDisconnectedPortError = (reason: unknown) => {
  if (!isDisconnectedPortError(reason)) {
    throw reason;
  }
};
