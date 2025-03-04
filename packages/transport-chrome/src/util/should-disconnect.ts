/**
 * set up expectation that the counterparty will disconnect. if the port is not
 * disconnected within `timeoutMs`, an error is thrown and the port is
 * disconnected from this side.
 *
 * @param port expected to disconnect
 * @param timeoutMs until fail and force disconnect (default 1 second)
 */
export const shouldDisconnect = (port: chrome.runtime.Port, timeoutMs = 1_000) =>
  new Promise<chrome.runtime.Port>((resolve, reject) => {
    port.onDisconnect.addListener(resolve);
    setTimeout(
      () => reject(new Error(`Port "${port.name}" did not disconnect within ${timeoutMs}ms`)),
      timeoutMs,
    );
  });
