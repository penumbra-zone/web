import { UAParser, UAParserInstance, IDevice } from 'ua-parser-js';

const parser: UAParserInstance = new UAParser();

const CompatibleBrowsers: Record<string, number> = {
  // browser name: min version

  // same as https://github.com/prax-wallet/web/blob/main/apps/extension/public/manifest.json#L7
  Chrome: 119,
};

interface CompatibilityResponse {
  isIncompatible: boolean;
  title: string;
  content: string;
}

// from: https://github.com/faisalman/ua-parser-js/issues/182
function isDesktop(device: IDevice): boolean {
  return device.type === undefined || !['wearable', 'mobile'].includes(device.type);
}

function getCompatibility(): CompatibilityResponse {
  const browser = parser.getBrowser();
  const device = parser.getDevice();

  if (!CompatibleBrowsers[browser.name!]) {
    return {
      isIncompatible: true,
      title: 'Incompatible Browser Detected',
      content:
        'You are currently using an incompatible browser. For the best experience, we recommend using Chrome as your browser.',
    };
  }

  if (
    !!CompatibleBrowsers[browser.name!] &&
    Number(browser.version) < CompatibleBrowsers[browser.name!]!
  ) {
    return {
      isIncompatible: true,
      title: 'Incompatible Browser Detected',
      content:
        'You are currently using an outdated browser. For the best experience, we recommend upgrading Chrome to the latest version.',
    };
  }

  if (!isDesktop(device)) {
    return {
      isIncompatible: true,
      title: 'Incompatible Device Detected',
      content:
        'You are currently using an incompatible environment. For the best experience, we recommend using a desktop as your device.',
    };
  }

  return {
    isIncompatible: false,
    title: '',
    content: '',
  };
}

export { getCompatibility };
