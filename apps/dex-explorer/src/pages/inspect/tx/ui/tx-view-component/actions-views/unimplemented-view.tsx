import { TriangleAlert } from 'lucide-react';
import { ViewBox } from '../viewbox';

export const UnimplementedView = ({ label }: { label: string }) => {
  return (
    <ViewBox
      label={label}
      visibleContent={
        <div className='flex gap-2 text-sm text-yellow-600'>
          <TriangleAlert className='w-4' />
          <span className='mt-1'>Unimplemented view</span>
        </div>
      }
    />
  );
};
