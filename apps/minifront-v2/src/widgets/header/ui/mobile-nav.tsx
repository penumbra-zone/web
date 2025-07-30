import { useState, useEffect, ReactNode, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@penumbra-zone/ui/Button';
import { PagePath } from '@/shared/const/page';
import { HEADER_LINKS } from './links';

// Context for sharing state between components
interface MobileNavContextType {
  isOpen: boolean;
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
  children: ({ isOpen }: { isOpen: boolean }) => ReactNode;
}

export const MobileNav = ({ children }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile nav when pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
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
    <MobileNavContext.Provider value={{ isOpen, setIsOpen }}>
      {children({ isOpen })}
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
  const { setIsOpen } = useMobileNavContext();
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

  // All links animate on hover, no conditional animation
  return (
    <div className='space-y-6 transition-all duration-300 ease-out'>
      {/* Navigation links section */}
      <div>
        <nav>
          <div className='flex flex-col space-y-2'>
            {HEADER_LINKS.map(link => {
              const Icon = link.icon;
              const isActive = currentPath === link.value;

              return (
                <button
                  key={link.value}
                  onClick={() => handleNavClick(link.value)}
                  className={`flex transform items-center gap-3 rounded-lg py-4 text-left transition-all duration-200 cursor-pointer user-select-none
                    ${isActive ? 'text-primary-light' : 'hover:text-text-primary'}
                    hover:translate-x-2
                  `}
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
