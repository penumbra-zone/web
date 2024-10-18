import { useBook } from '@/fetchers/book';
import { fromBaseUnit } from '@/old/utils/math/hiLo';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  Position,
  PositionId,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { innerToBech32Address } from '@/old/utils/math/bech32';
import { uint8ArrayToBase64 } from '@/old/utils/math/base64';
import { useAssets } from '@/shared/state/assets';
import { round } from '@/shared/round';
import { useComputePositionId } from '@/shared/useComputePositionId';

interface Route {
  lpId: string;
  position: Position;
  price: number;
  amount: number;
}

interface RouteWithTotal extends Route {
  total: number;
}

/**
 * This function loops over the route data and combines the routes with the same price
 * and counts the total from the route’s amount
 */
function getTotals(data: Route[], isBuySide: boolean, limit: number): RouteWithTotal[] {
  const totals = new Map<number, RouteWithTotal>();

  data.forEach((route: Route) => {
    const entry = totals.get(route.price);
    if (entry) {
      totals.set(route.price, {
        ...route,
        total: entry.total + route.amount,
        amount: Math.min(entry.amount, route.amount),
      });
    } else {
      totals.set(route.price, {
        ...route,
        total: route.amount,
      });
    }
  });

  return isBuySide
    ? Array.from(totals.values())
        .slice(0, limit)
        .toSorted((a, b) => b.price - a.price)
    : Array.from(totals.values()).slice(-limit);
}

function getDisplayData({
  data,
  computePositionId,
  asset1,
  asset2,
  isBuySide,
  limit,
}: {
  data: Position[];
  computePositionId: ((position: Position) => PositionId) | undefined;
  asset1: Metadata | undefined;
  asset2: Metadata | undefined;
  isBuySide: boolean;
  limit: number;
}): RouteWithTotal[] {
  if (!computePositionId || !asset1 || !asset2) {
    return [];
  }

  const asset1Exponent = getDisplayDenomExponent(asset1);
  const asset2Exponent = getDisplayDenomExponent(asset2);

  const getValue = (property: Amount | undefined, exponent: number) =>
    fromBaseUnit(BigInt(property?.lo ?? 0), BigInt(property?.hi ?? 0), exponent);

  const routes = data
    .filter(position => position.state?.state === PositionState_PositionStateEnum.OPENED)
    .map(position => {
      const direction = position.phi?.pair?.asset2?.equals(asset1.penumbraAssetId) ? -1 : 1;

      const r1 = getValue(position.reserves?.r1, direction === 1 ? asset1Exponent : asset2Exponent);
      const r2 = getValue(position.reserves?.r2, direction === 1 ? asset2Exponent : asset1Exponent);
      const p = getValue(
        position.phi?.component?.p,
        direction === 1 ? asset2Exponent : asset1Exponent,
      );
      const q = getValue(
        position.phi?.component?.q,
        direction === 1 ? asset1Exponent : asset2Exponent,
      );
      const price = Number(direction === 1 ? p.div(q) : q.div(p));
      const amount = isBuySide
        ? Number(direction === 1 ? r2 : r1) / price
        : Number(direction === 1 ? r1 : r2);

      const id = computePositionId(position);
      const innerStr = uint8ArrayToBase64(id.inner);
      const bech32Id = innerToBech32Address(innerStr, 'plpid');

      return {
        lpId: bech32Id,
        position,
        price,
        amount,
      };
    })
    .filter(displayData => displayData.amount > 0)
    .toSorted((a, b) => b.price - a.price) as Route[];

  return getTotals(routes, isBuySide, limit);
}

export function RouteBook() {
  const { data: assets } = useAssets();
  const asset1 = assets?.find(asset => asset.symbol === 'UM');
  const asset2 = assets?.find(asset => asset.symbol === 'GM');
  const asset1Exponent = asset1 ? getDisplayDenomExponent(asset1) : 0;
  const asset2Exponent = asset2 ? getDisplayDenomExponent(asset2) : 0;
  const { data: computePositionId } = useComputePositionId();
  const { data } = useBook(asset1?.symbol, asset2?.symbol, 100, 50);
  const asks = getDisplayData({
    data: data?.asks ?? [],
    computePositionId,
    asset1,
    asset2,
    isBuySide: false,
    limit: 8,
  });
  const bids = getDisplayData({
    data: data?.bids ?? [],
    computePositionId,
    asset1,
    asset2,
    isBuySide: true,
    limit: 8,
  });

  return (
    <div className='h-[512px] text-white'>
      <table className='w-full'>
        <thead>
          <tr>
            <th>Price</th>
            <th className='text-right'>Amount</th>
            <th className='text-right'>Total</th>
          </tr>
        </thead>
        <tbody>
          {asks.map(route => (
            <tr key={route.price} style={{ color: 'red' }}>
              <td className='text-left tabular-nums'>{round(route.price, asset2Exponent)}</td>
              <td className='text-right tabular-nums'>{round(route.amount, asset1Exponent)}</td>
              <td className='text-right tabular-nums'>{round(route.total, asset1Exponent)}</td>
            </tr>
          ))}
          {bids.map(route => (
            <tr key={route.price} style={{ color: 'green' }}>
              <td className='text-left tabular-nums'>{round(route.price, asset2Exponent)}</td>
              <td className='text-right tabular-nums'>{round(route.amount, asset1Exponent)}</td>
              <td className='text-right tabular-nums'>{round(route.total, asset1Exponent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
