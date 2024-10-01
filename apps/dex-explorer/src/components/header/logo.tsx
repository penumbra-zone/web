import Link from 'next/link'
import { PagePath } from '@/utils/routes/pages';
import PenumbraLogo from './logo.svg';

export const HeaderLogo = () => {
  return (
    <Link className='flex h-8 items-center' href={PagePath.Explore}>
      <PenumbraLogo />
    </Link>
  );
};
