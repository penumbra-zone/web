import maxBy from 'lodash/maxBy';
import { useRef, useEffect } from 'react';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { useBook } from '../../api/book';
import { Trace } from '@/shared/api/server/book/types';

function DepthChartRenderer({
  scale,
  width,
  height,
}: {
  scale: ScaleLinear<number, number>;
  width: number;
  height: number;
}) {
  const deptchChartRef = useRef<HTMLCanvasElement>(null);
  const { data } = useBook();
  console.log('TCL: data', data);

  useEffect(() => {
    if (deptchChartRef.current) {
      const ctx = deptchChartRef.current.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, width, height);

      const maxBuyTotal = maxBy(data?.multiHops.buy ?? [], order => Number(order.total))?.total;
      const maxSellTotal = maxBy(data?.multiHops.sell ?? [], order => Number(order.total))?.total;
      const maxTotal = Math.max(Number(maxBuyTotal), Number(maxSellTotal));
      const totalScale = scaleLinear().domain([0, maxTotal]).range([0, height]);

      function getCoordinates(orders: Trace[], isBuySide: boolean) {
        return orders.map((order, index) => {
          const price = order.price;
          const total = order.total;

          const neighboringOrder = orders[index + (isBuySide ? -1 : 1)];
          const price0 = isBuySide && neighboringOrder ? neighboringOrder.price : price;
          const price1 = !isBuySide && neighboringOrder ? neighboringOrder.price : price;

          const totalCoordinate = totalScale(Number(total));

          return {
            order,
            x0: scale(Number(price0)),
            x1: scale(Number(price1)),
            y0: totalCoordinate,
            y1: totalCoordinate,
          };
        });
      }

      function drawFilledPath(coordinates: [number, number][], fillStyle: string) {
        if (!ctx) {
          return;
        }

        ctx.beginPath();
        ctx.fillStyle = fillStyle;

        coordinates.forEach(([x, y]) => {
          // https://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
          // the 0.5 is necessary to avoid blurry lines
          ctx.lineTo(x + 0.5, y + 0.5);
        });

        ctx.fill();
        ctx.closePath();
        ctx.restore();
      }

      const buyCoordinates = getCoordinates(data?.multiHops.buy ?? [], true);
      const sellCoordinates = getCoordinates(data?.multiHops.sell ?? [], false);

      console.log('TCL: buyCoordinates', buyCoordinates);
      console.log('TCL: sellCoordinates', sellCoordinates);
      drawFilledPath(
        [
          ...buyCoordinates.map(({ x0, y0 }) => [x0, y0]),
          [buyCoordinates[buyCoordinates.length - 1].x1, 0],
          [buyCoordinates[0].x0, 0],
          [buyCoordinates[0].x0, height],
        ],
        'rgba(250, 250, 250, 0.05)',
      );
    }
  }, [data, height, scale]);

  return <canvas ref={deptchChartRef} style={{ width, height }} />;
}

export default DepthChartRenderer;
