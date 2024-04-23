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

    const p = new Array<number>(512);
    for (let i = 0; i < 256; i++) {
      p[i] = permutation[i]!;
      p[256 + i] = permutation[i]!;
    }

    // Start the theta animation. Returns the cleanup function that cancels the animation.
    return animateTheta(plots, coordinateCentrePoint, p);
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
        <mask id='plot1Mask'>
          <path
            id='plot1'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot2Mask'>
          <path
            id='plot2'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot3Mask'>
          <path
            id='plot3'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot4Mask'>
          <path
            id='plot4'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot5Mask'>
          <path
            id='plot5'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot6Mask'>
          <path
            id='plot6'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot7Mask'>
          <path
            id='plot7'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot8Mask'>
          <path
            id='plot8'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot9Mask'>
          <path
            id='plot9'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot10Mask'>
          <path
            id='plot10'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot11Mask'>
          <path
            id='plot11'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot12Mask'>
          <path
            id='plot12'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot13Mask'>
          <path
            id='plot13'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot14Mask'>
          <path
            id='plot14'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot15Mask'>
          <path
            id='plot15'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot16Mask'>
          <path
            id='plot16'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot17Mask'>
          <path
            id='plot17'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot18Mask'>
          <path
            id='plot18'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot19Mask'>
          <path
            id='plot19'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot20Mask'>
          <path
            id='plot20'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot21Mask'>
          <path
            id='plot21'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
        <mask id='plot22Mask'>
          <path
            id='plot22'
            fill='#fff'
            stroke='#fff'
            strokeWidth='0.25'
            fillRule='evenodd'
            filter='url(#shiny-filter)'
          />
        </mask>
      </defs>
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot1Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot2Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot3Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot4Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot5Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot6Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot7Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot8Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot9Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot10Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot11Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot12Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot13Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot14Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot15Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot16Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot17Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot18Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot19Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot20Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot21Mask)' />
      <rect width='100%' height='100%' fill='url(#grad1)' mask='url(#plot22Mask)' />
    </svg>
  );
};
