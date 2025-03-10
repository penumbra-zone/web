import Link from 'next/link';
import { PagePath } from '@/shared/const/pages';
import VeilLogo from '../assets/veil-combined-logo.svg';

export const HeaderLogo = () => {
  return (
    <Link className='flex h-8 items-center' href={PagePath.Explore}>
      <VeilLogo width={96} height={15} />
    </Link>
  );
};
