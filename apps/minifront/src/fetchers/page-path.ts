import { useLocation } from 'react-router-dom';
import { PagePath } from '../components/metadata/paths';

// Some pages have query params like: /tx/?hash=12342
// This normalizes to return a path of /tx instead of /tx/
export const removeTrailingSlash = (url: string): string => {
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const usePagePath = <T extends PagePath>() => {
  const location = useLocation();
  return matchPagePath(removeTrailingSlash(location.pathname)) as T;
};

export const matchPagePath = (str: string): PagePath => {
  /** @todo: Remove next line after we switch to v2 layout */
  const strFixed = str.replace('/v2', '');
  const pathValues = Object.values(PagePath);

  if (pathValues.includes(strFixed as PagePath)) {
    return strFixed as PagePath;
  }

  for (const pathValue of pathValues) {
    if (pathValue.includes(':')) {
      const regex = new RegExp('^' + pathValue.replace(/:(\w+)/g, '([^/]+)') + '$');
      const match = strFixed.match(regex);
      if (match) {
        return pathValue as PagePath;
      }
    }
  }

  throw new Error(`No match found for path: ${str}`);
};
