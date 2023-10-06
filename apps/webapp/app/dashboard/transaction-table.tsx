import { ArrowBottomLeftIcon, ChevronRightIcon, CopyIcon } from '@radix-ui/react-icons';
import { CopyToClipboard, Identicon, Table, TableBody, TableCell, TableRow } from 'ui';
import { FilledImage } from '../../shared';

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
                {/* TODO add name in hardcore valur  */}
                <Identicon
                  name='penumbrav2t1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvsneeae42q63sumem7r096p7rd2tywm2v6ppc4'
                  className='h-6 w-6 rounded-full'
                />
                <p>2t1m...2x95f</p>
              </div>
            </TableCell>
            <TableCell>
              <div className='flex items-center justify-end gap-[34px]'>
                <div className='flex items-center gap-2'>
                  {/* TODO add name in hardcore valur  */}
                  <Identicon
                    name='penumbrav2t1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvsneeae42q63sumem7r096p7rd2tywm2v6ppc4'
                    className='h-6 w-6 rounded-full'
                  />
                  <div className='flex flex-col items-center'>
                    <p>From</p>
                    <p className='text-[15px] font-normal leading-[22px]'>2t1m...2x45d</p>
                  </div>
                </div>
                <ChevronRightIcon className='mx-[6px] h-6 w-6' />
                <div className='flex items-center gap-2'>
                  <FilledImage src='/test-asset-icon.svg' className='h-6 w-6' alt='More' />
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
