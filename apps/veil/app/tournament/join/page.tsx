import {
  TournamentJoinPage as TournamentJoinPageComponent,
  TournamentQueryParams,
} from '@/pages/tournament/ui/join/page';

const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';
const imageUrl = `${baseUrl}/api/tournament/social-image.png`;

export default function TournamentJoinPage({
  searchParams,
}: {
  searchParams: TournamentQueryParams;
}) {
  return <TournamentJoinPageComponent imageUrl={imageUrl} searchParams={searchParams} />;
}

export function generateMetadata({ searchParams }: { searchParams: Record<string, string> }) {
  const queryString = new URLSearchParams(searchParams).toString();
  const url = `${imageUrl}?${queryString}`;

  return {
    title: 'Liquidity Tournament - Penumbra',
    description: 'Join Penumbra’s Liquidity Tournament and Win Rewards!',
    openGraph: {
      title: 'Liquidity Tournament - Penumbra',
      description: 'Join Penumbra’s Liquidity Tournament and Win Rewards!',
      images: url ? [url] : undefined,
      url: `${baseUrl}/tournament/join?${queryString}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Liquidity Tournament - Penumbra',
      description: 'Join Penumbra’s Liquidity Tournament and Win Rewards!',
      images: url ? [url] : undefined,
    },
  };
}
