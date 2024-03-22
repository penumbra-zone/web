import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const className =
  'inline-flex items-center rounded-full max-w-full bg-light-brown py-1 px-3 text-sm hover:bg-brown';

/**
 * A Pill is a small component, usually containing text and optionally an icon,
 * with rounded corners.
 */
export const Pill = ({ children, to }: { children: ReactNode; to?: string }) => {
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return <div className={className}>{children}</div>;
};
