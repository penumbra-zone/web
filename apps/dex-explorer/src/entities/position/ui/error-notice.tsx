import { BlockchainError } from '@/shared/ui/blockchain-error';

export const ErrorNotice = () => {
  return (
    <div className='min-h-[250px] flex items-center justify-center'>
      <BlockchainError
        message='An error occurred while loading data from the blockchain'
        direction='column'
      />
    </div>
  );
};
