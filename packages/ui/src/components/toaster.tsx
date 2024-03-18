import { Toaster as Sonner } from 'sonner';

import './toaster.css';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return <Sonner theme='dark' richColors {...props} />;
};

export { Toaster };
