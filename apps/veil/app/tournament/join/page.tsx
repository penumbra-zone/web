import {
  TournamentJoinPage as TournamentJoinPageComponent,
  TournamentParams,
} from '@/pages/tournament/ui/join/page';

const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';
const imageUrl = `${baseUrl}/api/tournament/social-image.png`;

export default function TournamentJoinPage({ searchParams }: { searchParams: TournamentParams }) {
  return <TournamentJoinPageComponent imageUrl={imageUrl} searchParams={searchParams} />;
}

export function generateMetadata({ searchParams }: { searchParams: URLSearchParams }): Metadata {
  const url = `${imageUrl}?${searchParams.toString()}`;

  return {
    title: 'Penumbra Tournament',
    description: 'Join the Penumbra Tournament and compete for rewards!',
    openGraph: {
      title: 'Penumbra Tournament',
      description: 'Join the Penumbra Tournament and compete for rewards!',
      images: url ? [url] : undefined,
      url: `${baseUrl}/tournament/join?${searchParams.toString()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Penumbra Tournament',
      description: 'Join the Penumbra Tournament and compete for rewards!',
      images: url ? [url] : undefined,
    },
  };
}
