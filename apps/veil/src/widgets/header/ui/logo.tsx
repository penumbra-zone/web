import Link from 'next/link';
import Image from 'next/image';
import { PagePath } from '@/shared/const/pages';

export const HeaderLogo = () => {
  return (
    <Link className='flex h-8 items-center' href={PagePath.Explore}>
      <Image 
        src='/assets/veil.svg' 
        alt='Veil' 
        width={120} 
        height={40}
        priority
      />
    </Link>
  );
};
