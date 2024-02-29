/* eslint-disable @typescript-eslint/no-unnecessary-condition */
// Rule disabled so Typescript doesn't complain about unnecessary env checks

enum Environment {
  NODE_DEV,
  NODE_PROD,
  CHROME_EXT_DEV,
  CHROME_EXT_PROD,
  BROWSER,
  UNKNOWN,
}

declare global {
  interface Window {
    // This file has many environments running it. Makes it hard to please every runtime.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore
    chrome?: {
      runtime?: {
        id?: string;
        getManifest: () => { update_url?: string };
      };
    };
  }
}

export const isDevEnv = (): boolean => {
  const env = getEnv();
  return env === Environment.CHROME_EXT_DEV || env === Environment.NODE_DEV;
};

// Should consider moving this to a package if other consumers need this
const getEnv = (): Environment => {
  // Check for Node.js environment
  if (globalThis.process?.versions?.node !== null) 
    return process.env['NODE_ENV'] === 'production' ? Environment.NODE_PROD : Environment.NODE_DEV;
  

  // Check for Chrome extension environment
  else if (globalThis?.window?.chrome?.runtime?.id) {
    return !('update_url' in globalThis.window.chrome.runtime.getManifest()) // Unpacked extensions do not have "update_url" field
      ? Environment.CHROME_EXT_DEV
      : Environment.CHROME_EXT_PROD;
  }

  // Check for browser environment
  else if (globalThis?.window) 
    return Environment.BROWSER;
  

  // If neither node.js, chrome extension, nor browser
  else 
    return Environment.UNKNOWN;
  
};
