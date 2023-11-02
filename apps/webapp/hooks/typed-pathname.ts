import { usePathname } from 'next/navigation';

export const useTypedPathname = <T>() => {
  const pathname = usePathname();

  return pathname as T;
};
