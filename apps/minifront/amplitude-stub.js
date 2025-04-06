const stub =
  stubName =>
  (...parameters) => {
    if (globalThis.__DEV__) {
      console.warn('stub', stubName, parameters);
    }
  };

export const init = stub('init');
export const track = stub('track');
export const setUserId = stub('setUserId');
