const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Extracts the first-level domain from a URL and capitalizes the first level to display as a title
export const extractDomain = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const parts = hostname.split('.');

    if (parts.length >= 2) {
      return capitalizeFirstLetter(parts.slice(-2).join('.'));
    }

    return capitalizeFirstLetter(hostname);
  } catch (e) {
    return '';
  }
};
