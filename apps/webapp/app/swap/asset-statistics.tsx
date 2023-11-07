'use client';

import { Card, Table, TableBody, TableCell, TableRow } from '@penumbra-zone/ui';
import { Fragment, useEffect, useState } from 'react';
import { FilledImage } from '../../shared';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { useStore } from '../../state';
import { swapSelector } from '../../state/swap';
import { Asset, displayUsd } from '@penumbra-zone/types';

export const AssetStatistics = () => {
  const { pay, receive } = useStore(swapSelector);

  const [firstAsset, setFirstAsset] = useState<
    (Asset & { price: number; '24h': number }) | undefined
  >();
  const [secondAsset, setSecondAsset] = useState<
    (Asset & { price: number; '24h': number }) | undefined
  >();

  useEffect(() => {
    setFirstAsset({ ...pay.asset, price: 10, '24h': -0.05 });
  }, [pay]);

  useEffect(() => {
    setSecondAsset({ ...receive.asset, price: 120, '24h': +20 });
  }, [receive]);

  return (
    <>
      {!secondAsset && !firstAsset ? (
        <div />
      ) : (
        <Card gradient className='row-span-1 md:p-4 xl:p-5'>
          <Table>
            <TableBody>
              {[firstAsset, secondAsset].map((asset, index) => {
                if (!asset) return <Fragment key={index} />;
                return (
                  <TableRow key={asset.display} className='border-b-[0px]'>
                    <TableCell className='py-3'>
                      <div className='flex items-end gap-2'>
                        {asset.icon && (
                          <FilledImage
                            src={asset.icon}
                            alt='Asset icon'
                            className='h-[30px] w-[30px]'
                          />
                        )}
                        <p className='text-base font-bold text-light-grey lg:text-[10px] lg:leading-4 xl:text-base'>
                          {asset.display}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='py-3'>
                      <div className='flex flex-col gap-[2px]'>
                        <p className='text-base font-normal text-muted-foreground lg:text-[15px] xl:text-base'>
                          Price
                        </p>
                        <p className='text-base font-bold lg:text-[10px] lg:leading-4  xl:text-base'>
                          ${displayUsd(asset.price)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='py-3'>
                      <div className='flex flex-col gap-[2px]'>
                        <p className='text-base font-normal text-muted-foreground lg:text-[15px] xl:text-base'>
                          24h
                        </p>
                        <p
                          className={cn(
                            'text-base lg:text-[10px] lg:leading-4 xl:text-base font-bold',
                            asset['24h'] >= 0 && 'text-green',
                            asset['24h'] < 0 && 'text-red',
                          )}
                        >
                          {`${asset['24h'] > 0 ? '+' : ''}${displayUsd(asset['24h'])}`}%
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='py-3'>
                      <div className='flex justify-end'>
                        <FilledImage
                          src={asset['24h'] >= 0 ? '/positive-charts.svg' : '/negative-charts.svg'}
                          alt='Charts'
                          className='h-[42px] w-[92px] lg:h-7 lg:w-[66px] xl:h-[42px] xl:w-[92px]'
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
};
