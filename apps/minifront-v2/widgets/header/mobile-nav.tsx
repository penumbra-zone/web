import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@penumbra-zone/ui/Button';
import { HEADER_LINKS } from './links';
import { StatusPopover } from './status-popover.tsx';
import { ProviderPopover } from './provider-popover.tsx';
import { HeaderLogo } from './logo.tsx';

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
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
        (link.value === '/portfolio' && location.pathname.startsWith('/portfolio')),
    );
    return currentLink?.value || '/portfolio';
  };

  const currentPath = getCurrentValue();

  return (
    <>
      <div className='lg:hidden'>
        <Button
          actionType='default'
          density='compact'
          onClick={() => setIsOpen(!isOpen)}
          aria-label='Toggle menu'
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {isOpen && (
        <div className='absolute left-0 top-full z-50 w-full bg-background/95 backdrop-blur-sm lg:hidden'>
          <div className='flex flex-col p-4 space-y-2'>
            {HEADER_LINKS.map(link => {
              const Icon = link.icon;
              const isActive = currentPath === link.value;

              return (
                <button
                  key={link.value}
                  onClick={() => handleNavClick(link.value)}
                  className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                  }`}
                >
                  <Icon size={20} />
                  <span className='font-medium'>{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
