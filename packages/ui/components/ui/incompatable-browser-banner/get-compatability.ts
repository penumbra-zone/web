import { UAParser, UAParserInstance, IDevice } from 'ua-parser-js';

const parser: UAParserInstance = new UAParser();

const CompatableBrowsers: Record<string, number> = {
  // browser name: min version
  Chrome: 119,
};

interface CompatabilityResponse {
  isIncompatable: boolean;
  title: string;
  content: string;
}

// from: https://github.com/faisalman/ua-parser-js/issues/182
function isDesktop(device: IDevice): boolean {
  return device.type === undefined || !['wearable', 'mobile'].includes(device.type);
}

function getCompatability(): CompatabilityResponse {
  const browser = parser.getBrowser();
  const device = parser.getDevice();

  if (!CompatableBrowsers[browser.name!]) {
    return {
      isIncompatable: true,
      title: 'Incompatable Browser Detected',
      content:
        'You are currently using an incompatible browser. For the best experience, we recommend using Chrome as your browser.',
    };
  }

  if (
    !!CompatableBrowsers[browser.name!] &&
    Number(browser.version) < CompatableBrowsers[browser.name!]!
  ) {
    return {
      isIncompatable: true,
      title: 'Incompatable Browser Detected',
      content:
        'You are currently using an outdated browser. For the best experience, we recommend upgrading Chrome to the latest version.',
    };
  }

  if (!isDesktop(device)) {
    return {
      isIncompatable: true,
      title: 'Incompatable Device Detected',
      content:
        'You are currently using an incompatible environment. For the best experience, we recommend using a desktop as your device.',
    };
  }

  return {
    isIncompatable: false,
    title: '',
    content: '',
  };
}

export { getCompatability };
