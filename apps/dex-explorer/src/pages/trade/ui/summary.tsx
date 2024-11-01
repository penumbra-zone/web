import { useSummary } from '@/pages/trade/model/useSummary.ts';

export const Summary = () => {
  const { data, isLoading, error } = useSummary();

  if (error) {
    return <div className='text-red-600'>Error: {String(error)}</div>;
  }

  if (isLoading || !data) {
    return <div className='text-white'>Loading...</div>;
  }

  return (
    <div className='text-white flex gap-2 max-w-6'>
      <div>current_price: {data.current_price}</div>
      <div>low_24h: {data.low_24h}</div>
      <div>high_24h: {data.high_24h}</div>
      <div>price_24h_ago: {data.price_24h_ago}</div>
      <div>swap_volume_24h: {data.swap_volume_24h}</div>
      <div>direct_volume_24h: {data.direct_volume_24h}</div>
    </div>
  );
};
