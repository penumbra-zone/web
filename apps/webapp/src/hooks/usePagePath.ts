import { useLocation } from 'react-router-dom';
import { PagePath } from '../components/metadata/paths.ts';

// Some pages have query params like: /tx/?hash=12342
// This normalizes to return a path of /tx instead of /tx/
export const removeTrailingSlash = (url: string): string => {
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const usePagePath = <T extends PagePath>() => {
  const location = useLocation();
  return removeTrailingSlash(location.pathname) as T;
};
