import { useState, useEffect, ReactNode, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@penumbra-zone/ui/Button';
import { PagePath } from '@shared/const/page';
import { HEADER_LINKS } from './links';

// Context for sharing state between components
interface MobileNavContextType {
  isOpen: boolean;
  isAnimating: boolean;
  setIsOpen: (open: boolean) => void;
}

const MobileNavContext = createContext<MobileNavContextType | null>(null);

const useMobileNavContext = () => {
  const context = useContext(MobileNavContext);
  if (!context) {
    throw new Error('MobileNav components must be used within MobileNav provider');
  }
  return context;
};

interface MobileNavProps {
  children: ({ isOpen, isAnimating }: { isOpen: boolean; isAnimating: boolean }) => ReactNode;
}

export const MobileNav = ({ children }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle opening/closing with proper animation timing
  const handleSetIsOpen = (open: boolean) => {
    if (open) {
      setIsOpen(true);
      setIsAnimating(false); // Start with content hidden
      // Small delay to allow background to appear first, then slide content in
      setTimeout(() => {
        setIsAnimating(true);
      }, 50); // Small delay for smooth slide-in
    } else {
      setIsAnimating(false);
      // Delay hiding the background until animation completes
      setTimeout(() => {
        setIsOpen(false);
      }, 300); // Match the content animation duration
    }
  };

  // Close mobile nav when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSetIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <MobileNavContext.Provider value={{ isOpen: isAnimating, isAnimating, setIsOpen: handleSetIsOpen }}>
      {children({ isOpen, isAnimating })}
    </MobileNavContext.Provider>
  );
};

// Toggle Button Component
const ToggleButton = () => {
  const { isOpen, setIsOpen } = useMobileNavContext();

  return (
    <Button
      iconOnly
      icon={isOpen ? X : Menu}
      actionType='default'
      density='compact'
      onClick={() => setIsOpen(!isOpen)}
      aria-label='Toggle menu'
      aria-expanded={isOpen}
    >
      Menu
    </Button>
  );
};

// Navigation Content Component
const Content = () => {
  const { setIsOpen, isAnimating } = useMobileNavContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const getCurrentValue = () => {
    const currentLink = HEADER_LINKS.find(
      link =>
        location.pathname === link.value ||
        (link.value === PagePath.Portfolio.toString() &&
          location.pathname.startsWith('/portfolio')),
    );
    return currentLink?.value ?? PagePath.Portfolio;
  };

  const currentPath = getCurrentValue();

  return (
    <div className={`transition-all duration-300 ease-out space-y-6 ${
      isAnimating 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 -translate-y-4'
    }`}>
      {/* Navigation links section */}
      <div>
        <nav>
          <div className='flex flex-col space-y-2'>
            {HEADER_LINKS.map((link, index) => {
              const Icon = link.icon;
              const isActive = currentPath === link.value;

              return (
                <button
                  key={link.value}
                  onClick={() => handleNavClick(link.value)}
                  className={`flex items-center gap-3 rounded-lg p-4 text-left transition-all duration-200 transform hover:scale-[1.02] ${
                    isActive
                      ? 'text-primary-light'
                      : 'hover:text-text-primary'
                  }`}
                  style={{
                    animationDelay: isAnimating ? `${index * 50}ms` : '0ms',
                    transitionDelay: isAnimating ? `${index * 30}ms` : '0ms',
                  }}
                >
                  <Icon size={20} className='text-primary-light' />
                  <span className='font-medium'>{link.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

// Attach sub-components
MobileNav.ToggleButton = ToggleButton;
MobileNav.Content = Content;
