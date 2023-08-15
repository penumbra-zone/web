import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@ui/lib/utils';

const logoVariants = cva('inline-flex items-center justify-center', {
  variants: {
    size: {
      sm: 'h-36 w-72',
      default: 'h-[200px] w-[300px]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface LogoProps
  extends React.SVGProps<SVGSVGElement>,
    VariantProps<typeof logoVariants> {
  onlyWords?: boolean;
}

// FYI, multiple logos on pages will make onlyWords prop to not be regarded.
// The SVG defs appear to be global.
const Logo = React.forwardRef<SVGSVGElement, LogoProps>(
  ({ className, size, onlyWords, ...props }, ref) => {
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        version='1.2'
        className={cn(logoVariants({ size, className }))}
        ref={ref}
        fill='none'
        {...props}
        viewBox='0 0 658 399'
      >
        {!onlyWords && (
          <defs>
            <radialGradient id='a' cx='328' cy='196.7' r='188.2' gradientUnits='userSpaceOnUse'>
              <stop offset='0.126' stopColor='#563c70'></stop>
              <stop offset='0.318' stopColor='#e1813b'></stop>
              <stop offset='0.742' stopColor='#ff902f'></stop>
              <stop offset='0.939' stopColor='#8be4d9'></stop>
            </radialGradient>
          </defs>
        )}
        <>
          <path
            fill='url(#a)'
            fillRule='evenodd'
            d='M505.8 283.5c-13.5 16.8-31.4 25.3-48.6 33.5-14.9 7.2-30.4 14.5-43.2 27.2-24.9 24.7-45.6 38.1-64.9 42.2q-6.4 1.4-12.7 1.4c-12.5 0-25.1-4.1-39.3-12.5-29.4-17.5-51.9-20.8-71.7-23.6-14.5-2.1-28.2-4-42.5-11.4-23.4-12.1-36.3-29.3-39.4-52.4-3-22.4 3.2-50.6 19-86.2 7.1-16 3.4-42.3-.2-67.7-2.3-15.8-4.6-32.2-4.3-46 .4-15.5 4.2-25.9 11.5-32 23.9-19.5 70.5-13.6 104.6-9.3 9.2 1.1 17.1 2.1 23.6 2.5 18.8 1.1 42.2-9.7 67-21.1 13.4-6.2 27.2-12.6 41.3-17.6 19.3-6.9 34.5-6.5 45.2 1.2 12.4 9 18.4 27.7 17.7 55.5-.6 23.9-3 41.4-4.9 55.4-3.3 24.5-5.6 40.7 3.5 68.6 4.1 12.8 14 24.1 23.6 35 16.3 18.6 31.7 36.2 14.7 57.3zm-15-57l-3.2-3.8q.3.5.7 1c15.3 18.4 29.7 35.9 13.7 56.5-12.9 16.6-30 25.5-46.5 34-14 7.2-28.4 14.7-40.7 26.9-23.7 23.6-43.5 36.6-62.3 41.1-4.8 1.1-9.5 1.6-14.2 1.6-11.7 0-23.5-3.5-36.8-10.7-27.9-15.2-49.8-18.4-69-21.2-15-2.1-29.1-4.2-43.7-11.6-23-11.9-36.1-28.6-39.9-51.1-3.7-21.8 1.2-49.3 14.9-84 6.2-15.8 3-40.8-.1-64.9-4.1-31.7-8.3-64.4 8-78.4 23.4-19.9 68.9-15.7 102.1-12.7 8.3.8 16.2 1.5 22.5 1.7q.9.1 1.8.1c18 0 39.8-9.5 62.7-19.4 13.4-5.8 27.2-11.8 41.2-16.4 18.8-6.2 33.6-5.5 44.2 2.2 12.2 8.8 18.4 26.5 18.5 52.7 0 22.1-1.6 38-3 52.1-2.4 24.2-4 40.3 4.8 67.6q.7 2 1.5 4.1-.5-1.3-.9-2.6c-9-27.9-6.8-44.2-3.5-68.7 1.9-14.1 4.3-31.5 4.9-55.4.7-27.7-5.2-46.3-17.5-55.2-10.6-7.6-25.7-8-44.9-1.2-14 5.1-27.9 11.4-41.2 17.6-23.6 10.9-46 21.2-64.4 21.2h-2.8c-6.5-.4-14.5-1.4-23.7-2.6-15.6-1.9-34-4.2-51.6-4.2-20.5 0-39.9 3.1-52.6 13.5-7.3 6-11 16.3-11.4 31.7-.3 13.7 2 30.1 4.2 46 3.6 25.4 7.4 51.7.2 67.9-15.7 35.5-21.9 63.6-18.9 85.9 3.1 23 15.9 40.1 39.2 52.2 14.2 7.3 27.9 9.3 42.4 11.3 19.8 2.9 42.3 6.1 71.8 23.7 18.9 11.2 34.9 14.6 51.7 11.1 19.3-4.1 39.9-17.5 64.7-42.1 12.9-12.8 28.4-20.2 43.3-27.3 17.2-8.2 35-16.7 48.5-33.4 16.8-20.9 1.5-38.3-14.7-56.8zm-23.1-32.4q-.8-2.1-1.5-4.2c-8.8-27.4-7.2-43.5-4.8-67.8 1.3-14 2.9-29.9 2.9-52 0-26.1-6.2-43.7-18.3-52.4-10.5-7.6-25.2-8.3-43.9-2.2-14 4.6-27.8 10.6-41.1 16.4-23 10-44.8 19.4-62.9 19.4h-1.8c-6.3-.2-14.2-1-22.5-1.7-13.2-1.2-28.2-2.6-43.1-2.6-22.6 0-44.7 3.2-58.8 15.2-16.2 13.8-11.9 46.5-7.9 78 3.2 24.2 6.4 49.3.1 65.1-13.7 34.7-18.6 62.1-14.9 83.8 3.9 22.5 16.9 39.1 39.8 50.9 14.5 7.4 28.6 9.4 43.6 11.6 19.2 2.8 41.1 5.9 69.1 21.2 18.5 10.1 34.2 12.9 50.7 9 18.7-4.4 38.5-17.4 62.2-41 12.3-12.2 26.7-19.7 40.7-26.9 16.5-8.5 33.6-17.3 46.4-33.9 15.9-20.4 1.6-37.8-13.6-56.1-2.1-2.5-4.1-4.9-6.1-7.5q1.8 2.4 3.6 4.7c14.2 18.3 27.6 35.6 12.6 55.9-12.2 16.4-27.9 25.2-44.5 34.5-13 7.2-26.4 14.8-38 26.4-22.3 22.2-41.8 35.3-59.8 40-5.2 1.3-10.4 2-15.7 2-10.9 0-22.1-2.9-34.3-8.9-26.3-13.1-47.4-16.1-66-18.8-15.5-2.2-30.2-4.4-45.2-12-22.6-11.5-35.9-27.8-40.4-49.8-4.5-21.1-.9-47.9 10.8-81.8 5.4-15.4 2.8-38 0-62-3.7-31.6-7.5-64.2 8.7-78.8 22.9-20.5 67.5-17.9 100.1-16 7.7.4 15 .9 21.1.9h.5c17.7 0 38.9-8.5 61.2-17.6 13.4-5.4 27.3-11 41.3-15.2 18.2-5.4 32.7-4.4 43.2 3.2 12 8.6 18.4 25.3 19.2 49.9.6 20.4-.3 35.5-1.1 48.8-1.3 23.1-2.3 39.8 6.2 66.5q1 3 2.2 5.8zm11.1 18.8q2 2.8 4 5.5c13.2 18.2 25.6 35.3 11.6 55.3-11.6 16.4-26.6 25.5-42.5 35.2-12.1 7.3-24.5 14.8-35.4 25.8-21.1 21.2-39.8 33.9-57.2 38.9-5.8 1.6-11.6 2.5-17.5 2.5-10.1 0-20.3-2.4-31.4-7.3-24.7-10.8-44.9-13.7-62.8-16.3-16.2-2.3-31.5-4.5-47-12.3-22.2-11.2-35.7-27.1-41-48.5-5.2-20.6-2.9-46.6 6.9-79.6 4.5-15.1 2.3-36.4-.1-58.9-3.3-31.6-6.7-64.3 9.6-79.6 22.5-21.1 66.4-20.1 98.4-19.3 7 .1 13.6.3 19.3.2 17.1-.3 37.3-7.8 58.6-15.8 13.6-5.1 27.5-10.3 41.7-14 17.7-4.8 31.9-3.4 42.4 4.1 11.7 8.4 18.3 24.2 19.8 47 1.2 19.2.9 33.5.8 46.2-.4 22.6-.6 39 7.6 64.9q.7 2.3 1.6 4.6-.6-1.5-1-3c-8.6-26.9-7.6-43.6-6.3-66.7.8-13.3 1.7-28.4 1.1-48.8-.6-18.6-4.5-32.8-11.6-42.3-6.9-9.2-16.8-13.8-29.5-13.8-6.2 0-13.2 1.1-20.8 3.4-14 4.2-27.8 9.8-41.2 15.2-22.4 9-43.6 17.6-61.4 17.6h-.5c-6.1-.1-13.4-.5-21.2-.9-10.1-.6-21.6-1.3-33.1-1.3-14.7 0-26.7 1.1-36.9 3.3-12.7 2.8-22.4 7.4-29.7 13.9-16.1 14.4-12.3 47-8.7 78.5 2.9 24 5.5 46.6.1 62.2-11.7 33.8-15.3 60.5-10.9 81.6 4.6 21.8 17.8 38 40.3 49.5 14.9 7.6 29.5 9.7 45 11.9 18.7 2.7 39.8 5.8 66.2 18.8 12.4 6.1 23.2 8.9 34 8.9 11.3 0 22.6-3.1 34.5-9.6 12.6-6.9 25.9-17.4 40.8-32.3 11.6-11.6 25.1-19.2 38.1-26.5 16.6-9.2 32.2-18 44.4-34.4 3.5-4.8 5.6-9.6 6.3-14.5.6-4.4 0-9-1.7-13.8-3.2-9.1-10-17.8-17.2-27.1-2.2-2.8-4.4-5.6-6.5-8.4zm-1.6-1.5q1.4 2.2 2.8 4.3c12.2 18 23.7 35.1 10.6 54.7-11.1 16.5-25.5 26-40.8 36.1-11 7.3-22.3 14.7-32.4 25.1-19.9 20.2-37.8 32.5-54.6 37.7-6.6 2-13 3.1-19.7 3.1-9 0-18.3-1.9-28.3-5.8-22.8-8.6-41.9-11.3-58.9-13.7-17.8-2.5-33.2-4.7-49.4-12.7-21.9-10.9-35.5-26.4-41.7-47.3-5.9-20.1-4.9-45.4 3-77.3 3.6-14.7 1.8-34.5-.1-55.5-2.9-31.7-5.9-64.5 10.5-80.6 9.9-9.7 24.6-16.1 44.9-19.5 17.5-2.9 36-3.2 52.4-3.4 6-.1 11.7-.2 16.8-.4 16.5-.7 35.5-7.1 55.6-14 13.6-4.7 27.8-9.5 42.1-12.8 17.2-4 31.1-2.3 41.5 5.2 11.4 8.1 18.3 23 20.4 44.1 1.8 17.8 2.2 31.5 2.6 43.6.7 22.1 1.3 38.1 9.1 63.2l.2.6c-7.9-25.5-7.7-41.7-7.3-64.1.2-12.7.4-27-.8-46.1-1.1-17.8-5.4-31.3-12.8-40.3-7.2-8.8-17.3-13.2-30-13.2-5.7 0-12 .9-18.8 2.7-14.1 3.8-28.1 9-41.6 14-21.4 8-41.6 15.6-58.8 15.9h-3.8c-4.8 0-10-.1-15.5-.3-6.4-.1-13-.3-19.8-.3-11.2 0-27.9.4-43.1 3.5-15.4 3.1-26.9 8.4-35.2 16.1-16.1 15.1-12.7 47.7-9.4 79.2 2.3 22.5 4.6 43.9 0 59-9.7 32.9-12 58.8-6.9 79.3 5.4 21.4 18.7 37.1 40.8 48.3 15.5 7.7 30 9.8 46.9 12.2 17.9 2.6 38.1 5.5 62.9 16.4 11.1 4.8 21.3 7.2 31.1 7.2 11.3 0 22.6-3.1 34.4-9.5 12.4-6.7 25.5-17.1 40.1-31.7 10.9-11.1 23.4-18.6 35.4-26 15.9-9.6 30.8-18.7 42.4-35 6.3-9 7.7-17.8 4.4-27.9-3-8.9-9.3-17.6-16-26.8q-2.6-3.6-5.2-7.3zm-2-1.9q1 1.7 2.1 3.3c11.1 18 21.6 35 9.5 54.3-10.5 16.6-24.5 26.7-39.2 37.3-9.9 7.1-20.1 14.4-29.4 24-18.7 19.2-35.7 31.2-52 36.6-7.3 2.5-14.6 3.7-22 3.7-8 0-16.2-1.4-25-4.2-20.5-6.7-38.4-9.1-54.2-11.2-19.1-2.6-35.5-4.8-52.6-13.2-21.5-10.6-35.4-25.7-42.3-46.1-6.7-19.6-7-44.1-1-75 1.9-9.4 1.9-20.8 1.2-33.2.5 11.2.2 21.4-1.9 29.9-7.9 31.9-8.9 57-3 77 6.1 20.7 19.6 36.1 41.4 46.9 16.1 8.1 31.4 10.2 49.2 12.7 17 2.4 36.2 5.1 59 13.8 10 3.8 19.2 5.7 28.1 5.7 11.5 0 22.7-3.1 34.5-9.4 12.3-6.6 25.2-16.8 39.3-31.2 10.2-10.4 21.6-17.9 32.6-25.2 15.2-10 29.6-19.6 40.6-36 5.9-8.7 7.2-17.4 4.1-27.4-2.7-8.8-8.5-17.5-14.6-26.6q-2.2-3.2-4.4-6.5zm-16.7-19.2c9.5 69.1-32.8 136.2-101.2 156.1 24.9-6.1 47-19.9 65.7-41.1 8.8-9.8 15.8-19.3 21.6-28.9 6.3-10.7 11-21.4 14.3-32.7 5-17.7 3.4-35.8-.4-53.4zm1.1-16.8c-4.6-18.7-5.1-32.8-5.7-51.1-.3-12.1-.8-25.8-2.6-43.6-1.7-16.9-6.4-29.8-14.1-38.4-7.5-8.3-17.7-12.5-30.5-12.5-5.1 0-10.7.7-16.6 2-14.2 3.4-28.4 8.2-42.1 12.9-20.1 6.8-39.1 13.3-55.7 14-5.1.2-10.8.3-16.8.4-16.3.2-34.8.5-52.3 3.4-20.2 3.4-34.8 9.7-44.6 19.3-16.2 15.9-13.2 48.6-10.3 80.1l.6 7.2c-2.5-31.9-5-64.8 11.4-81.8 9.9-10.2 24.6-17.2 44.9-21.3 17.4-3.6 35.9-4.5 52.2-5.4 4.8-.2 9.3-.4 13.6-.7 15.5-1 33-6.4 51.6-12.2 14.1-4.3 28.7-8.8 43.4-11.7 16.6-3.2 30.3-1.2 40.7 6.2 11.1 7.9 18.2 21.8 21 41.3 2.4 16.8 3.5 30 4.4 41.7 1.5 17.3 2.7 31.6 7.5 50.2zM169.5 166c-.8-13-1.3-26-.3-37.8 1.5-16.8 5.8-28.8 13.3-36.9 10-10.8 24.8-18.5 45.3-23.5 17.6-4.3 36.3-5.9 52.8-7.3 3.1-.2 6.1-.5 9-.7 14.4-1.4 30.1-5.7 46.9-10.3 14.8-4.1 30.1-8.3 45.5-10.7 16.3-2.5 29.8 0 40.2 7.5 10.7 7.7 17.8 20.6 21.2 38.2 3.2 16.3 5 29.4 6.6 40.9 1.9 13.6 3.6 25.8 7 40.2-3.3-14.9-4.3-27.5-5.5-42.3-1-11.6-2.1-24.8-4.5-41.6-2.3-16.1-7.6-28.3-15.6-36.5-7.8-7.9-18.3-11.9-31-11.9-4.5 0-9.3.5-14.3 1.5-14.6 2.8-29.2 7.3-43.3 11.7-18.6 5.7-36.2 11.1-51.8 12.2-4.2.3-8.8.5-13.6.7-16.2.8-34.7 1.8-52.1 5.3-20.2 4.2-34.7 11.1-44.5 21.2-16 16.5-13.7 48.7-11.3 80.1zm271.1-30.8l2.8 5.4c-6-14-13.2-27.1-22.3-41-13.5-20.6-34-33-59.3-35.8-6.3-.8-12.9-1.1-19.7-1.1-17.6 0-36.9 2.3-58.9 7.1-18.5 4.1-35.3 10.2-49.9 18.2-16.4 9.1-29.5 20.3-38.9 33.3-10.1 14.1-16.3 32.8-18.4 55.7q-.3 3.6-.5 7.4.1-1.4.3-2.7c1.3-10.3 3.6-20.1 6.7-29.2 3.4-9.5 7.8-18.3 13-26.1 4.8-6.9 10.4-13.4 16.7-19.4 6.1-5.9 13-11.2 20.5-16 7.2-4.7 15.1-8.8 23.4-12.3 8.1-3.4 16.7-6.2 25.5-8.4 12.9-3.1 25.8-5 38.4-5.6q4.1-.2 8.2-.2c10.3 0 20.2.9 29.7 2.7 11.9 2.2 23 6.2 33.1 12 10.2 5.8 19.3 13.4 26.9 22.6 9.2 10.9 16.6 21.8 22.7 33.4zm5.6 8.9c-5.4-15.2-11.7-30-20.8-47.5-12.1-23.3-32.6-36.4-59.5-37.7-2.8-.1-5.7-.2-8.6-.2-24.9 0-50.3 4.9-72.8 9.3-19.5 3.7-36.8 9.1-51.3 15.9-17.7 8.3-31.5 18.9-41.1 31.5-9.9 13.1-15.5 31.2-17.2 55.2q-.3 4.4-.4 8.9l.2-2.6c1-11 3-21.1 5.8-30.1 3.2-9.9 7.5-18.8 12.9-26.2 9.5-13.2 22.7-24.6 39.3-33.7 7.5-4.1 15.7-7.8 24.4-10.9 8.2-3 16.9-5.5 25.8-7.4 30.6-6.7 56.4-8.7 79-6.1 25.8 2.9 46.6 15.5 60.3 36.4 10 15.3 17.7 29.6 24 45.2zM317.3 350.6c12.3 0 24.7-1.6 36.7-4.9 18.4-4.9 35.3-13.3 50.1-24.9 14.4-11.3 26.3-25 35.4-40.9 9.2-15.8 15.1-33 17.5-51.1 2.6-18.7 1.4-37.5-3.5-55.9-4.2-15.3-10.8-29.8-19.7-42.8-8.6-12.6-19.2-23.7-31.4-32.9-12.1-9.1-25.5-16.2-39.9-21.1-14.5-5-29.7-7.5-45.1-7.5-12.3 0-24.7 1.7-36.7 4.9-18.4 5-35.3 13.4-50.1 25-14.4 11.2-26.3 25-35.4 40.8-9.2 15.9-15.1 33.1-17.5 51.2-2.6 18.7-1.4 37.5 3.5 55.8 4.2 15.4 10.8 29.8 19.7 42.9 8.6 12.6 19.2 23.6 31.4 32.9 12.1 9.1 25.5 16.2 39.9 21.1 14.5 4.9 29.7 7.4 45.1 7.4zm155.9-143.2q.6 1.2 1.3 2.4c10.1 18 19.7 35 8.5 54-10 16.9-23.5 27.6-37.9 38.9-8.7 6.8-17.6 13.8-26.1 22.5-17.5 18.2-33.6 29.8-49.4 35.5-8.2 3-16.3 4.5-24.8 4.5-6.8 0-13.8-.9-21.2-2.9-18-4.7-33.5-6.6-48.5-8.5-20.7-2.6-38.5-4.8-56.8-13.7-41.3-20.1-56.5-57.5-47.8-117.6 1-7.4 1.2-15.7.9-24.7.1 7.8-.3 15-1.6 21.4-6 30.7-5.7 55.1.9 74.6 6.9 20.2 20.6 35.2 42 45.7 17 8.4 33.4 10.6 52.4 13.1 15.8 2.2 33.7 4.6 54.3 11.2 8.8 2.9 16.9 4.2 24.8 4.2 11.6 0 23-3 34.7-9.2 12.2-6.6 24.9-16.7 38.8-30.9 9.4-9.6 19.6-16.9 29.5-24.1 14.7-10.6 28.6-20.6 39-37.1 5.4-8.6 6.7-17.2 3.9-27-2.5-8.8-7.8-17.4-13.4-26.5q-1.8-2.9-3.5-5.8zm-301.9 15.2c-8.7 59.7 6.4 96.8 47.4 116.8 17.1 8.3 33.9 10.8 53.1 13.2-16.8-2.1-32.2-5.1-47.6-12.5-10.4-5-19.4-11.3-26.6-18.6-7.2-7.2-13-15.7-17.3-25.2-4.2-9.4-7-20.1-8.4-31.9-1.3-11.5-1.4-24.4-.1-38.4.5-5.7.6-11.9.5-18.5-.1 5.4-.4 10.4-1 15.1zM448.5 147c-5.2-17.4-10.5-33.1-18.8-53.5-10.6-25.8-31-39.4-58.9-39.4h-.8c-21.4.2-42.9 4.3-63.7 8.3-7.2 1.3-13.9 2.6-20.5 3.7-21.5 3.6-38.2 8-52.6 13.7-9.1 3.6-17.1 7.7-24 12.3-7.7 5.1-14.2 11-19.3 17.4-8.6 10.8-13.7 25.8-15.6 45.9-.6 6.7-.8 13.6-.9 20.6q.2-2.7.3-5.4c1.7-24.4 7.4-42.6 17.5-55.9 9.6-12.7 23.6-23.5 41.5-31.9 14.6-6.8 31.9-12.2 51.6-16 25.3-4.9 54-10.4 81.7-9.1 27.3 1.4 48.2 14.6 60.4 38.3 7.2 13.9 12.9 26.5 17.9 39.4 1.4 3.7 2.8 7.5 4.2 11.6zm2.2 3.6q-1.2-4.7-2.4-9.3c-4-15.8-7.8-30.7-14.3-50.8-4.4-13.7-11.5-24.2-21-31.2-9.1-6.7-20.6-10.2-33.9-10.2q-2.5 0-5.1.2c-18.2 1.1-36.5 5-54.2 8.8-11.5 2.4-22.3 4.7-32.7 6.2-17.7 2.5-36.5 5.6-54 11.4-20.5 6.7-35.4 15.9-45.5 27.9-7.9 9.5-12.6 22.9-14.4 41.2-.9 8.8-1 18-.8 27.3.1-5.7.3-11.3.9-16.8 1.9-20.3 7-35.5 15.7-46.4 5.2-6.6 11.8-12.5 19.6-17.7 6.9-4.6 15.1-8.8 24.2-12.4 14.5-5.8 31.3-10.1 52.8-13.8 6.6-1.1 13.3-2.3 20.5-3.7 20.8-4 42.4-8.1 63.9-8.3h.8c13.8 0 25.8 3.3 35.8 9.8 10.5 6.7 18.6 17 24.1 30.3 9 22 14.4 38.6 20 57.5zM170.8 136c1.6-17.4 6.2-30.1 13.9-38.9 23.1-26.2 68.1-31.4 100.9-35.3l2.7-.3c12.7-1.5 26.3-4.8 40.8-8.3 15.9-3.8 32.4-7.8 48.9-9.6 15.6-1.8 28.7 1 39 8.2 10.6 7.4 18.1 19.4 22.2 35.6 4.3 16.9 6.9 30.1 9.4 42.8 1.9 9.8 3.8 19.2 6.3 29.6-2.6-11.9-4.1-22.6-5.7-34.3-1.6-11.5-3.4-24.6-6.6-40.9-2.9-15.2-8.7-26.9-17.1-34.6-8.2-7.5-18.9-11.3-31.8-11.3-3.7 0-7.6.3-11.6.9-15.3 2.4-30.6 6.6-45.4 10.7-16.8 4.6-32.6 8.9-47 10.2-2.9.3-5.9.6-9.1.8-16.4 1.4-35 3-52.6 7.3-20.4 4.9-35.1 12.5-44.9 23.2-7.4 8-11.7 19.9-13.1 36.4-1 12.2-.4 25.6.4 38.9-.4-10.6-.5-21.2.4-31.1zm2.3 93.4c.2-4.1.2-8.4.1-12.9q-.1 5-.5 9.6c-1.3 13.9-1.2 26.8.1 38.2 1.4 11.7 4.2 22.3 8.3 31.6 4.2 9.4 10 17.8 17.1 25 7.2 7.2 16.1 13.4 26.4 18.4 14.2 6.8 28.4 9.9 43.8 12-13.3-2.1-25.8-5.3-38.3-11.3-10.2-4.8-19.2-10.9-26.6-18-7.4-7.1-13.5-15.3-18.1-24.6-4.6-9.2-8-19.5-10-30.9-2-11.2-2.8-23.7-2.3-37.1zM273.4 350q-4.4-.9-8.6-2c-8.1-2-15.6-4.7-22.9-8-19.8-9.2-35.5-22.8-46.6-40.4-11-17.4-17.6-38.7-19.5-63.2l-.2-3c.5 25.4 5.8 47.1 15.7 64.6 5 8.9 11.4 16.8 18.8 23.6 7.5 6.9 16.4 12.7 26.4 17.4 11.9 5.6 24.1 8.9 36.9 11zm3.3-.7c-10.3-2.1-19.8-5.2-28.9-9.4-9.7-4.4-18.7-10-26.7-16.6-7.9-6.5-14.9-14.1-20.9-22.5-11.4-16.1-18.9-35.3-22.5-57.1 2.6 21.3 8.8 39.8 18.6 55.3 11 17.4 26.5 30.8 46.1 39.9 10.4 4.8 21.7 8.2 34.3 10.4zm3-.7l-3.4-.8c-7.8-2-15.4-4.7-22.6-7.9-9.6-4.3-18.6-9.7-26.7-16.1-8.2-6.4-15.6-13.7-22-21.8-6.4-8.3-11.9-17.4-16.3-27.1-3-6.6-5.6-13.5-7.6-20.6 4.1 17.1 10.8 32.5 20.1 45.7 11.9 16.9 27.8 29.9 47.2 38.8 9.6 4.4 20.1 7.7 31.3 9.8zm3.8-.6c-43-10.5-79.9-40.9-97.6-83.4 4.9 13.4 11.7 25.6 20.2 36.5 12.8 16.3 29 28.9 48.2 37.5 9.2 4.2 19 7.3 29.2 9.4zM233.4 92.2c-15 9.6-27.4 21.4-36.7 35-10.3 15.1-16.8 33.5-19.5 54.7q-.4 3.1-.7 6.2c8.3-53.9 47.3-100.6 103.4-115.9-17 4.3-32.6 11.1-46.5 20zm72.3 262c8.6.8 17.5 1.6 26.8 2.8 4 .5 8 .8 11.7.8 13.1 0 25.4-3 37.5-9.3 12.6-6.4 25.1-16.4 38.3-30.3 6-6.3 12.1-12.1 18.1-17.6 14-13.2 27.3-25.6 36.4-43.8 9.2-18.3 1.5-35.5-6.6-53.6l-1.2-2.8c7 18.1 13.1 35.3 4.9 53.5-9 19.9-22.8 34-37.5 48.8-4.1 4.2-8.3 8.5-12.5 13-14 15-27.7 25.5-41.6 32-12 5.6-24.3 8.3-37.5 8.3q-2.8 0-5.7-.2c-5.5-.3-10.9-.5-16.2-.8q-7.6-.4-14.9-.8zM172.2 144.7c1.8-18.5 6.6-32.1 14.7-41.7 10.2-12.2 25.2-21.4 45.9-28.3 17.5-5.8 36.4-8.9 54.1-11.4 10.4-1.5 21.2-3.8 32.7-6.2 17.7-3.8 36.1-7.7 54.4-8.8 14.8-.9 27.6 2.1 37.8 9 10.6 7.1 18.3 18.2 23.1 32.9 6.5 20.1 10.3 35.1 14.4 50.9 1.1 4.5 2.3 9.1 3.5 13.8-1.9-8.4-3.5-16.4-5.1-24.6-2.5-12.7-5.1-25.8-9.4-42.7-3.6-14.5-10-25.5-18.9-32.9-8.7-7.1-19.7-10.7-32.7-10.7-2.8 0-5.7.1-8.6.4-16.5 1.9-32.9 5.8-48.8 9.7-14.5 3.5-28.2 6.8-40.9 8.3l-2.7.3c-16.8 2-35.9 4.2-54.1 9.2-21 5.9-36.1 14.3-46.2 25.8-7.6 8.6-12.1 21.2-13.7 38.3-1 10.6-.8 21.9-.3 33.3-.2-8.4 0-16.7.8-24.6zm244.7-42c-15.1-18-35.5-29.8-59.2-34.1-9.4-1.8-19.3-2.7-29.4-2.7h-.1c-11 0-22.3 1.1-33.8 3.1 7.7-1.2 15.4-1.9 23-1.9 50.5 0 97.5 27.1 123 70.6-6.4-12.3-14.1-23.8-23.5-35zm45.6 92.7c4.6 17.6 7.4 34.7 1.5 51.9-3.9 11.2-9.4 22-17 33-7.4 10.7-16.2 20.7-23.8 29.1-5.7 6.3-11.6 12-17.7 16.9-6 4.9-12.3 9.1-18.7 12.6-6.4 3.5-13.1 6.3-19.9 8.4-6.8 2.1-14 3.5-21.3 4.2q-7.5.7-14.6 1.1c3.1 0 6.4 0 10.2-.1 29.7-.5 55.2-13.5 80.3-40.8q2.4-2.5 4.8-5.1c16.1-17.4 31.4-33.9 40.4-56.4 7.3-18.3 2-36.1-4.2-54.8zm5.3 55.2c-4.2 10.4-9.7 20-17.5 30.3-7 9.1-14.8 17.6-23.2 26.5-1.5 1.7-3.1 3.4-4.7 5.2-25.3 27.5-51.1 40.5-81.2 41.1-5.5.1-11.2.1-16.9.1h-5.6q1 .1 2 .1c5.2.3 10.6.5 16.2.8q2.8.2 5.6.2c14 0 27-3.1 39.6-9.4 13-6.6 25.6-16.5 38.7-30.5 4.2-4.5 8.4-8.9 12.5-13 14.6-14.8 28.4-28.8 37.3-48.5 8.3-18.5 1.5-36.1-5.7-54.7q-.2-.5-.4-.9c5.9 17.9 10.4 35 3.3 52.7zm-197.1 100c-12-2.1-23.5-5.3-34.7-10.6-10.1-4.7-19-10.6-26.6-17.6-7.5-6.9-13.9-14.9-19-23.9-5.1-8.9-9-19-11.6-29.9-2.6-10.9-4.1-22.9-4.3-35.7q-.1-3.9-.3-7.9 0 2.3-.1 4.5c-.5 13.3.3 25.7 2.3 36.8 2 11.3 5.3 21.6 9.9 30.6 4.6 9.2 10.6 17.4 17.9 24.3 7.3 7.1 16.2 13.1 26.3 17.9 13 6.2 26.2 9.4 40.2 11.5zM471 205.2q.4.7.7 1.3c9.1 18.1 17.7 35.2 7.5 54-9.5 17.5-22.9 28.9-37 41-7.3 6.3-15 12.9-22.3 20.6-16.4 17.1-31.7 28.3-46.8 34.3-9.2 3.6-18.5 5.5-28.3 5.5q-8.2 0-16.8-1.7c-14.9-3-28.2-4.4-41.2-5.9-4.7-.5-9.4-1-13.9-1.6q1.1.2 2.3.3c14.3 1.8 30.6 3.8 48.6 8.6 7.4 1.9 14.2 2.8 21 2.8 12 0 23.5-3 35.2-9.2 12.3-6.5 24.9-16.4 38.5-30.5 8.4-8.8 17.4-15.8 26.1-22.7 14.3-11.2 27.8-21.8 37.7-38.6 5-8.5 6.2-17 3.7-26.8-2.3-8.7-7.1-17.3-12.2-26.4l-2.8-5zm-2.2-2.4c8.2 18.4 15.9 35.7 6.6 54.4-9.2 18.4-22.5 30.9-36.7 44.1-5.9 5.5-12 11.3-18 17.6-15.2 16-29.6 26.9-44.2 33.2-10.4 4.5-21 6.7-32.3 6.7q-5.8 0-11.8-.8c-10.9-1.4-21.2-2.3-31.1-3.2q-4.6-.4-9.1-.8c11.3 1.3 23.1 2.7 36 5.3 5.8 1.1 11.3 1.7 16.7 1.7 12.4 0 24.2-3 36.1-9.2 12.4-6.5 24.9-16.4 38.2-30.4 7.4-7.6 15.1-14.2 22.5-20.6 14-12 27.3-23.4 36.7-40.7 10-18.4 1.5-35.3-7.5-53.2q-1-2-2.1-4.1zm-8.4-9.9c1.3 6 2.1 11.4 2.6 16.6 1.1 12.7.2 24-2.8 34.6-1.7 5.7-3.7 11.5-6.2 17.1-2.4 5.3-5.1 10.6-8.3 15.9-5.7 9.7-12.8 19.2-21.6 29.1-5.1 5.8-10.6 11.1-16.1 15.8-5.7 4.7-11.7 8.9-17.8 12.5-6.1 3.6-12.6 6.7-19.3 9.1-6.7 2.5-13.7 4.5-20.9 5.7q-3.2.6-6.4 1.1.9-.1 1.9-.2c14.6-1.4 27.9-5.5 40.7-12.4 12.7-6.9 24.5-16.5 36.1-29.3 15.7-17.4 31.8-36.4 40.5-61.6 6.1-17.8 2.7-35.5-2.4-54z'
          ></path>
          <path
            fill='#fff'
            fillRule='evenodd'
            d='M212.2 180.9h16.1V237h-12.8L179 206.1V237h-16.2v-56.1h12.7l36.7 31zm-122.7 0H146v13.7h-40.3v7.3h39.6V215h-39.6v8.2H146v13.7H89.5zm-15.9 8.5c1.5 2.7 2.3 5.6 2.3 8.7 0 11-7.6 17.1-18.8 17.1H32V237H15.8v-56.1h41.3c7.4 0 13.3 3.3 16.5 8.5zm-13.9 8.7c0-2.8-1.5-4.2-4.6-4.2H31.9v8.3h23.2c3.1 0 4.6-1.2 4.6-4.1zm417.7 24c0 8.9-7.3 14.9-18.1 14.9h-44.6v-56.1h42.9c5.6 0 10.1 1.4 13.3 4.1 3.1 2.8 4.7 6.4 4.7 10.8 0 8-5.7 12.1-15.6 12.7 10.9.2 17.4 5.1 17.4 13.6zm-46.5-27.4l.1 7.5h23.8c2.9 0 4.6-.9 4.6-3.7 0-2.8-1.8-3.8-4.6-3.8zm30.2 24.5c0-2.8-1.8-4.3-4.6-4.3h-25.6l.1 8.3h25.5c3.1 0 4.6-1.3 4.6-4zm-169.3-38.3H308v27c0 23.2-11.5 30.4-30.7 30.4-19.1 0-30.6-7.2-30.6-30.4v-27h16.2v29.4c0 8.9 5.4 13.6 14.4 13.6 9.1 0 14.5-4.7 14.5-13.6zm259 40.6c2.5 3.7 5.4 8.8 8.6 15.5h-19.7c-3.8-6.9-6.7-11.8-8.7-14.8-2-2.9-3.9-4.9-5.9-6.1-1.9-1.2-4.4-1.7-7.3-1.7h-10.4V237h-16.1v-56.1h45.2c11.3 0 18.1 5.9 18.1 14.8s-7.1 14.1-18.1 14.1h-5.7c9 .6 14.9 4.3 20 11.7zm-17.1-19.4c3.1 0 4.7-1.2 4.7-4.1 0-2.9-1.6-4.2-4.7-4.2h-26.4l.1 8.3zM653.9 237h-19.1l-5.3-9.5h-35.7l-5.3 9.5h-19.1l33.6-56.1h17.3zm-32.1-23.3l-10.1-18.2-10.1 18.2zm-238.6-32.8h12.9V237H380v-26.8L362.5 237h-3.4l-17.4-26.8V237h-16.2v-56.1h12.9l22.4 33.4z'
          ></path>
        </>
      </svg>
    );
  },
);

Logo.displayName = 'Logo';

export { Logo, logoVariants };
