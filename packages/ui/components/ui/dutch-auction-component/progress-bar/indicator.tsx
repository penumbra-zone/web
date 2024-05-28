import { CircleArrowRight, CircleCheck } from 'lucide-react';

export const Indicator = ({ icon }: { icon: 'arrow' | 'checkmark' }) =>
  icon === 'arrow' ? (
    <CircleArrowRight size={16} />
  ) : (
    <CircleCheck size={16} className='text-green' />
  );
