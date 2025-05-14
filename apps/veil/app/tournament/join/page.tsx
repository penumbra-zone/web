import { TournamentJoinPage as TournamentJoinPageComponent } from '@/pages/tournament/ui/join/page';
import { TournamentQueryParams } from '@/features/tournament-earnings-canvas';

const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';
const imageUrl = `${baseUrl}/api/tournament/social-image.png`;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<TournamentQueryParams>;
}) {
  const params = await searchParams;
  return <TournamentJoinPageComponent imageUrl={imageUrl} searchParams={params} />;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const queryString = new URLSearchParams(params).toString();
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
