'use client';

import { usePathname } from 'next/navigation';
import { PagePath } from '../const/pages';

const removeTrailingSlash = (url: string): string => {
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const matchPagePath = (str: string): PagePath => {
  const pathValues = Object.values(PagePath);

  if (pathValues.includes(str as PagePath)) {
    return str as PagePath;
  }

  for (const pathValue of pathValues) {
    if (pathValue.includes(':')) {
      const regex = new RegExp('^' + pathValue.replace(/:(\w+)/g, '([^/]+)') + '$');
      const match = str.match(regex);
      if (match) {
        return pathValue as PagePath;
      }
    }
  }

  return PagePath.Home;
};

export const usePagePath = <T extends PagePath>() => {
  const pathname = usePathname();
  return matchPagePath(removeTrailingSlash(pathname ?? '')) as T;
};
