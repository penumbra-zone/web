import { useEffect } from 'react';
import { useBackground } from '@/shared/contexts/background-context';

export const PageBackground = () => {
  const { background } = useBackground();

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    // Remove existing background classes
    const backgroundClasses = [
      'bg-shield-background',
      'bg-unshield-background', 
      'bg-cover',
      'bg-center',
      'bg-no-repeat',
      'bg-fixed'
    ];
    
    body.classList.remove(...backgroundClasses);
    html.classList.remove(...backgroundClasses);

    // Apply background based on current state using Tailwind classes
    if (background === 'shield') {
      // Apply to both html and body to prevent scroll issues
      const shieldClasses = ['bg-shield-background', 'bg-cover', 'bg-center', 'bg-no-repeat', 'bg-fixed'];
      body.classList.add(...shieldClasses);
      html.classList.add(...shieldClasses);
    } else if (background === 'unshield') {
      // Apply to both html and body to prevent scroll issues  
      const unshieldClasses = ['bg-unshield-background', 'bg-cover', 'bg-center', 'bg-no-repeat', 'bg-fixed'];
      body.classList.add(...unshieldClasses);
      html.classList.add(...unshieldClasses);
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