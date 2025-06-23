import { Text } from '@penumbra-zone/ui/Text';

interface PortfolioCardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
}

export function PortfolioCard({ title, children }: PortfolioCardProps) {
  return (
    <div className='gap-4 p-6 flex flex-col items-stretch self-stretch rounded-lg bg-other-tonal-fill5 backdrop-blur-lg'>
      {title && (
        <Text xxl color={'text.primary'}>
          {title}
        </Text>
      )}
      {children}
    </div>
  );
}
