import { Link } from 'react-router-dom';
import { PagePath } from '@/shared/const/page';
import PenumbraLogo from '../assets/logo.svg';

export const HeaderLogo = () => {
  return (
    <Link className='flex h-8 items-center' to={PagePath.INDEX}>
      <PenumbraLogo />
    </Link>
  );
};
