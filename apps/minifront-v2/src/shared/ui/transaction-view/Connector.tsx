import React from 'react';

export const Connector: React.FC = () => {
  return (
    <div className='h-3 w-full pl-5'>
      {' '}
      {/* Full width, fixed height for spacing, left padding for indent */}
      <div className='h-full w-px border-l-2 border-other-tonal-stroke'></div>{' '}
      {/* Vertical line, takes full height of parent, w-px for the line itself */}
    </div>
  );
};
