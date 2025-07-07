import { createContext, useContext, useState, ReactNode } from 'react';

export type BackgroundType = 'default' | 'shield' | 'unshield';

interface BackgroundContextType {
  background: BackgroundType;
  setBackground: (background: BackgroundType) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

interface BackgroundProviderProps {
  children: ReactNode;
}

export const BackgroundProvider = ({ children }: BackgroundProviderProps) => {
  const [background, setBackground] = useState<BackgroundType>('default');

  return (
    <BackgroundContext.Provider value={{ background, setBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
};
