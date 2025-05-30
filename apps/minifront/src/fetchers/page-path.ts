import { useLocation } from 'react-router-dom';
import { PagePath } from '../components/metadata/paths';

// Some pages have query params like: /tx/?hash=12342
// This normalizes to return a path of /tx instead of /tx/
export const removeTrailingSlash = (url: string): string => {
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- useful type narrowing
export const usePagePath = <T extends PagePath>() => {
  const location = useLocation();
  return matchPagePath(removeTrailingSlash(location.pathname)) as T;
};

export const matchPagePath = (str: string): PagePath => {
  const pathValues = Object.values(PagePath);

  // 1. Try direct match with the raw path (e.g., /v2/portfolio, or /send if PagePath.SEND is '/send')
  if (pathValues.includes(str as PagePath)) {
    return str as PagePath;
  }

  // 2. Handle dynamic paths.
  // The PagePath value itself should define the full path, including /v2 if applicable (e.g., /v2/tx/:hash)
  for (const pathValue of pathValues) {
    if (pathValue.includes(':')) {
      // Create a regex from the pathValue (e.g., '/v2/tx/:hash' becomes /^\/v2\/tx\/([^/]+)$/)
      // Escape regex special characters in the pathValue string first
      const escapedPathValue = pathValue.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      const regexPattern = '^' + escapedPathValue.replace(/:(\w+)/g, '([^/]+)') + '$';
      const regex = new RegExp(regexPattern);
      const match = str.match(regex);
      if (match) {
        return pathValue as PagePath; // Return the enum value itself (e.g., PagePath.V2_TRANSACTION_DETAILS)
      }
    }
  }

  throw new Error(`No match found for path: ${str}`);
};
