import cn from 'clsx';

type BannerType = 'success' | 'warning' | 'error';

const bgColorMapping = {
  success: 'bg-teal-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
};

const titleColorMapping = {
  success: 'text-teal-50',
  warning: 'text-yellow-50',
  error: 'text-red-50',
};

const contentColorMapping = {
  success: 'text-teal-100',
  warning: 'text-yellow-100',
  error: 'text-red-100',
};

interface BannerProps extends React.ComponentPropsWithoutRef<'div'> {
  type: BannerType;
  title: string;
  content: string;
  className?: string;
}

export const Banner = ({ type, title, content, className, ...props }: BannerProps) => (
  <div
    className={cn(
      'relative z-[99] w-full text-center font-headline',
      bgColorMapping[type],
      className,
    )}
    {...props}
  >
    <div className='m-auto p-3'>
      <p className={cn('text-base font-bold', titleColorMapping[type])}>{title}</p>
      <p className={cn('text-sm', contentColorMapping[type])}>{content}</p>
    </div>
  </div>
);

export const AlphaDevelopmentBanner = () => (
  <Banner
    type='warning'
    title='Alpha Development'
    content='This software is currently in its alpha stage and under continuous development. Features will continue to improve for an enhanced user experience.'
  />
);
