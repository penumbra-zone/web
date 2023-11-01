import { usePathname } from 'next/navigation';

export const useTypesafePathname = <T>() => {
  const pathname = usePathname();

  return pathname as T;
};
