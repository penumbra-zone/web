import { ArrowBottomLeftIcon, ChevronRightIcon, CopyIcon } from '@radix-ui/react-icons';
import { CopyToClipboard, Table, TableBody, TableCell, TableRow } from 'ui';
import { FilledImage, UnoptimizedImage } from '../../shared';

export const TransactionTable = () => {
  return (
    <Table>
      <TableBody>
        {[1, 2, 3].map(i => (
          <TableRow key={i}>
            <TableCell>
              <div className='flex items-center gap-3'>
                <ArrowBottomLeftIcon className='h-5 w-5' />
                <div className='flex flex-col pr-1'>
                  <p>Receive</p>
                  <p className='text-[15px] font-normal leading-[22px]'>Aug.14 12:32 pm</p>
                </div>
                <CopyToClipboard
                  text='tx-hash'
                  label={
                    <div>
                      <CopyIcon className='h-4 w-4 text-muted hover:opacity-50' />
                    </div>
                  }
                  className='w-4'
                />
              </div>
            </TableCell>
            <TableCell>
              <div className='flex items-center justify-center gap-[10px]'>
                <UnoptimizedImage
                  src='https://avatar.vercel.sh/rauchg'
                  alt='icon'
                  width={20}
                  height={20}
                  className='rounded-full'
                />
                <p>2t1m...2x95f</p>
              </div>
            </TableCell>
            <TableCell>
              <div className='flex items-center justify-end gap-[34px]'>
                <div className='flex items-center gap-2'>
                  <UnoptimizedImage
                    src='https://avatar.vercel.sh/rauchg'
                    alt='icon'
                    width={20}
                    height={20}
                    className='rounded-full'
                  />
                  <div className='flex flex-col items-center'>
                    <p>From</p>
                    <p className='text-[15px] font-normal leading-[22px]'>2t1m...2x45d</p>
                  </div>
                </div>
                <ChevronRightIcon className='mx-[6px] h-6 w-6' />
                <div className='flex items-center gap-2'>
                  <UnoptimizedImage
                    src='https://avatar.vercel.sh/rauchg'
                    alt='icon'
                    width={20}
                    height={20}
                    className='rounded-full'
                  />
                  <div className='flex flex-col items-center'>
                    <p className='text-green'>+ 10.00</p>
                    <p className='text-[15px] font-normal leading-[22px]'>gn</p>
                  </div>
                </div>
                <FilledImage
                  src='/more.svg'
                  className='h-4 w-4 cursor-pointer hover:opacity-50'
                  alt='More'
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
