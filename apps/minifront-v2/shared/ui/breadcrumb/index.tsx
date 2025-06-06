import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { PagePath } from '@shared/const/page';

export interface BreadcrumbItem {
  label: string;
  path?: PagePath;
}

export interface BreadCrumbProps {
  /**
   * The items to display in the breadcrumb
   */
  items: BreadcrumbItem[];
}

/**
 * A shared breadcrumb navigation component
 * First layer is text-secondary, and the second layer is text-primary
 */
export const BreadCrumb = ({ items }: BreadCrumbProps) => {
  return (
    <nav aria-label='breadcrumb'>
      <ol className='flex items-center'>
        {items.map((item, index) => (
          <Fragment key={index}>
            {index > 0 && <ChevronRight size={16} className='mx-1 text-muted-foreground' />}
            <li>
              {item.path ? (
                <Link to={item.path}>
                  <Text
                    color={index === items.length - 1 ? 'text.primary' : 'text.secondary'}
                    variant='large'
                  >
                    {item.label}
                  </Text>
                </Link>
              ) : (
                <Text
                  color={index === items.length - 1 ? 'text.primary' : 'text.secondary'}
                  variant='large'
                >
                  {item.label}
                </Text>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
};
