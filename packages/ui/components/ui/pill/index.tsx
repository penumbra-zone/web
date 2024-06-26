import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const BASE_CLASSES =
  'inline-flex items-center rounded-full max-w-full bg-light-brown py-1 px-3 text-sm hover:bg-brown';

interface PillProps {
  children: ReactNode;
  /**
   * If this pill should be rendered using the `Link` component from
   * `react-router-dom`, enter the `Link`'s `to` prop here.
   */
  to?: string;
  variant?: 'default' | 'dashed';
}

/**
 * A Pill is a small component, usually containing text and optionally an icon,
 * with rounded corners.
 */
export const Pill = ({ children, to, variant = 'default' }: PillProps) => {
  let className = BASE_CLASSES;

  if (variant === 'dashed') {
    className = `${BASE_CLASSES} border-[1px] border-dashed border-sand`;
  }

  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return <div className={className}>{children}</div>;
};
