import { Link } from 'react-router-dom';
import { PagePath } from '../../metadata/paths.ts';
import { getV2Link } from '../get-v2-link.ts';
import PenumbraLogo from './logo.svg';

export const HeaderLogo = () => {
  return (
    <Link className='flex h-8 items-center' to={getV2Link(PagePath.INDEX)}>
      <PenumbraLogo />
    </Link>
  )
};
