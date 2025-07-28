import { useEffect } from 'react';
import { useBackground } from '@/shared/contexts/background-context';

export const PageBackground = () => {
  const { background } = useBackground();

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    // Remove existing background classes
    const backgroundClasses = ['bg-shield-background', 'bg-unshield-background'];

    body.classList.remove(...backgroundClasses);
    html.classList.remove(...backgroundClasses);

    // Apply background based on current state
    if (background === 'shield') {
      // Apply to both html and body to prevent scroll issues
      body.classList.add('bg-shield-background');
      html.classList.add('bg-shield-background');
    } else if (background === 'unshield') {
      // Apply to both html and body to prevent scroll issues
      body.classList.add('bg-unshield-background');
      html.classList.add('bg-unshield-background');
    }

    // Cleanup function to remove background when component unmounts
    return () => {
      body.classList.remove(...backgroundClasses);
      html.classList.remove(...backgroundClasses);
    };
  }, [background]);

  // This component doesn't render anything visible
  return null;
};
