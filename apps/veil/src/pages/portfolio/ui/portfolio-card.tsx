import { Text } from '@penumbra-zone/ui/Text';

interface PortfolioCardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
}

export function PortfolioCard({ title, children }: PortfolioCardProps) {
  return (
    <div className='flex flex-col items-stretch gap-4 self-stretch rounded-lg bg-other-tonal-fill5 p-6 backdrop-blur-lg'>
      {title && (
        <Text xxl color={'text.primary'}>
          {title}
        </Text>
      )}
      {children}
    </div>
  );
}
