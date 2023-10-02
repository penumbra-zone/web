import React from 'react';

export const ReceiveForm = () => {
  return (
    <form
      className='flex flex-col gap-2'
      onSubmit={e => {
        e.preventDefault();
      }}
    ></form>
  );
};
