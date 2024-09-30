import { UAParser, UAParserInstance, IDevice } from 'ua-parser-js';

const parser: UAParserInstance = new UAParser();

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
  const device = parser.getDevice();

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
