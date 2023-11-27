import {
  IdenticonGradient,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@penumbra-zone/ui';
import { displayUsd, fromBaseUnitAmount, shortenAddress } from '@penumbra-zone/types';
import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { throwIfExtNotInstalled } from '../../fetchers/is-connected.ts';
import { AccountBalance, getBalancesByAccount } from '../../fetchers/balances.ts';
import { AssetIcon } from '../shared/asset-icon.tsx';
import { assets } from '@penumbra-zone/constants';

export const AssetsLoader: LoaderFunction = async (): Promise<AccountBalance[]> => {
  await throwIfExtNotInstalled();
  return await getBalancesByAccount();
};

export default function AssetsTable() {
  const data = useLoaderData() as AccountBalance[];

  if (data.length === 0) {
    return (
      <div className='flex flex-col gap-6'>
        <p>
          No balances found. Try requesting tokens by pasting your address in{' '}
          <a style={{ color: '#aaaaff' }} href='https://discord.gg/CDNEnzX6YC'>
            the faucet channel
          </a>{' '}
          on Discord!
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {data.map(a => {
        return (
          <div key={a.index} className='flex flex-col gap-4'>
            <div className='flex flex-col items-center justify-center'>
              <div className='flex flex-col items-center justify-center gap-2 md:flex-row'>
                <div className='flex items-center gap-2'>
                  <IdenticonGradient name={a.address} size={20} className='rounded-full' />
                  <h2 className='font-bold md:text-base xl:text-xl'>Account #{a.index}</h2>{' '}
                </div>
                <div className='font-mono text-sm italic text-foreground'>
                  {shortenAddress(a.address)}
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-[34px] md:hidden'>
              {a.balances.map((asset, i) => (
                <div key={i} className='flex items-center justify-between border-b pb-3'>
                  <div className='flex items-center gap-2'>
                    <AssetIcon
                      asset={
                        assets.find(i => i.display === asset.denom.display) ?? {
                          display: '',
                        }
                      }
                    />
                    <p className='font-mono text-base font-bold'>{asset.denom.display}</p>
                  </div>
                  <p className='font-mono text-base font-bold'>
                    {fromBaseUnitAmount(asset.amount, asset.denom.exponent).toFormat()}
                  </p>
                  <p className='font-mono text-base font-bold'>
                    {asset.usdcValue == 0 ? '$–' : `$${displayUsd(asset.usdcValue)}`}
                  </p>
                </div>
              ))}
            </div>
            <Table className='hidden md:table'>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-1/3 text-center'>Asset</TableHead>
                  <TableHead className='w-1/3 text-center'>Balance</TableHead>
                  <TableHead className='w-1/3 text-center'>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {a.balances.map((asset, i) => (
                  <TableRow key={i}>
                    <TableCell className='w-1/3'>
                      <div className='flex items-center gap-2'>
                        <AssetIcon
                          asset={
                            assets.find(i => i.display === asset.denom.display) ?? {
                              display: '',
                            }
                          }
                        />
                        <p className='font-mono text-base font-bold'>{asset.denom.display}</p>
                      </div>
                    </TableCell>
                    <TableCell className='w-1/3 text-center font-mono'>
                      <div className='flex flex-col'>
                        <p className='text-base font-bold'>
                          {fromBaseUnitAmount(asset.amount, asset.denom.exponent).toFormat()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='w-1/3 text-center font-mono'>
                      <div className='flex flex-col'>
                        <p className='text-base font-bold'>
                          {asset.usdcValue == 0 ? '$–' : `$${displayUsd(asset.usdcValue)}`}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}
