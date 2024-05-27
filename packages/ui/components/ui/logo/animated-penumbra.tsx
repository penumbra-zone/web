import { useEffect } from 'react';
import {
  animateTheta,
  extractViewBoxDimensions,
  initializePlotsArr,
  permutation,
} from './animation-logic';

// React component version of animated-penumbra.svg
export const AnimatedPenumbra = ({ className }: { className: string }) => {
  useEffect(() => {
    const coordinateCentrePoint = extractViewBoxDimensions();
    const noiseIntensityFactor = coordinateCentrePoint * 0.0014;
    const plots = initializePlotsArr(noiseIntensityFactor);

    // Start the theta animation. Returns the cleanup function that cancels the animation.
    return animateTheta(plots, coordinateCentrePoint);
  }, []);

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      id='ringPlots'
      viewBox='0 0 1000 1000'
      width='100%'
      height='100%'
      style={{ backgroundColor: 'black' }}
      shapeRendering='geometricPrecision'
      className={className}
    >
      <defs>
        <radialGradient id='grad1' cx='50%' cy='50%' r='50%' fx='50%' fy='50%'>
          <stop offset='57%' style={{ stopColor: '#563c70', stopOpacity: 1 }} />
          <stop offset='66%' style={{ stopColor: '#e1813b', stopOpacity: 1 }} />
          <stop offset='67%' style={{ stopColor: '#f77e14', stopOpacity: 1 }} />
          <stop offset='87%' style={{ stopColor: '#8be4d9', stopOpacity: 1 }} />
        </radialGradient>
        <mask id='gradMask' fill='#fff' stroke='#fff' strokeWidth='0.25' fillRule='evenodd'>
          <path id='plot1' />
          <path id='plot2' />
          <path id='plot3' />
          <path id='plot4' />
          <path id='plot5' />
          <path id='plot6' />
          <path id='plot7' />
          <path id='plot8' />
          <path id='plot9' />
          <path id='plot10' />
          <path id='plot11' />
          <path id='plot12' />
          <path id='plot13' />
          <path id='plot14' />
          <path id='plot15' />
          <path id='plot16' />
          <path id='plot17' />
          <path id='plot18' />
          <path id='plot19' />
          <path id='plot20' />
          <path id='plot21' />
          <path id='plot22' />
        </mask>
      </defs>
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#gradMask)' />
    </svg>
  );
};
