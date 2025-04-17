import {
  TournamentJoinPage,
  generateMetadata as generateMetadataFromComponent,
} from '@/pages/tournament/ui/join/page';

export function generateMetadata({ searchParams }: { searchParams: URLSearchParams }) {
  return generateMetadataFromComponent({ searchParams });
}

export default TournamentJoinPage;
