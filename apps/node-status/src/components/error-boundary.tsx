import { useRouteError } from 'react-router-dom';

export const ErrorBoundary = () => {
  const error = useRouteError();

  console.error(error);

  return (
    <div className='text-red'>
      <h1 className='text-xl'>{String(error)}</h1>
    </div>
  );
};
