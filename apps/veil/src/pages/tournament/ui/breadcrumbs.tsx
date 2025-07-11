import { ReactNode, Fragment } from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbsProps {
  items: ReactNode[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <div className='flex flex-wrap items-center gap-2 overflow-hidden'>
      {items.map((item, index) => (
        <Fragment key={index}>
          {index !== 0 && <ChevronRight className='size-6 text-neutral-light' />}
          {item}
        </Fragment>
      ))}
    </div>
  );
};
