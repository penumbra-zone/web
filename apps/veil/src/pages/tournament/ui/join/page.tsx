import { Metadata } from 'next';
import { createCanvas } from 'canvas';
import { drawTournamentEarningsCanvas } from '../shared/tournament-earnings-canvas';
import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { PagePath } from '@/shared/const/pages';
import { redirect } from 'next/navigation';

const keyMap = {
  epoch: 't',
  earnings: 'e',
  votingStreak: 'v',
  incentivePool: 'i',
  lpPool: 'l',
  delegatorPool: 'd',
};

function encodeParams(obj: Record<string, string>) {
  return Object.entries(obj)
    .map(([key, value]) => `${keyMap[key as keyof typeof keyMap]}=${value}`)
    .join('&');
}

export interface TournamentParams extends Record<string, string> {
  epoch: string;
  earnings: string;
  votingStreak: string;
  incentivePool: string;
  lpPool: string;
  delegatorPool: string;
}

function getQueryParam(
  searchParams: URLSearchParams | Record<string, string | string[]>,
  key: string,
): string {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get(key) ?? '';
  }
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

async function generateShareImage(params: TournamentParams): Promise<string | null> {
  try {
    const canvas = createCanvas(512, 512);
    // @ts-expect-error - canvas types don't match exactly but functionality is the same
    await drawTournamentEarningsCanvas(canvas, params);

    const imageBuffer = canvas.toBuffer('image/png');
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Failed to generate share image:', error);
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: URLSearchParams;
}): Promise<Metadata> {
  const params: TournamentParams = {
    epoch: getQueryParam(searchParams, 't') || '135',
    earnings: getQueryParam(searchParams, 'e') || '17280:UM',
    votingStreak: getQueryParam(searchParams, 'v') || '80000:UM',
    incentivePool: getQueryParam(searchParams, 'i') || '100000:UM',
    lpPool: getQueryParam(searchParams, 'l') || '100000:UM',
    delegatorPool: getQueryParam(searchParams, 'd') || '100000:UM',
  };

  const shareImage = await generateShareImage(params);
  console.log('TCL: shareImage', shareImage);
  const url = `https://dex.penumbra.zone/tournament/join?${encodeParams(params)}`;

  return {
    title: 'Penumbra Tournament',
    description: 'Join the Penumbra Tournament and compete for rewards!',
    openGraph: {
      title: 'Penumbra Tournament',
      description: 'Join the Penumbra Tournament and compete for rewards!',
      images: shareImage ? [shareImage] : undefined,
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Penumbra Tournament',
      description: 'Join the Penumbra Tournament and compete for rewards!',
      images: shareImage ? [shareImage] : undefined,
    },
  };
}

export async function TournamentJoinPage({ searchParams }: { searchParams: URLSearchParams }) {
  const params: TournamentParams = {
    epoch: getQueryParam(searchParams, 't') || '135',
    earnings: getQueryParam(searchParams, 'e') || '17280:UM',
    votingStreak: getQueryParam(searchParams, 'v') || '80000:UM',
    incentivePool: getQueryParam(searchParams, 'i') || '100000:UM',
    lpPool: getQueryParam(searchParams, 'l') || '100000:UM',
    delegatorPool: getQueryParam(searchParams, 'd') || '100000:UM',
  };

  const epoch = Number(params.epoch);
  if (!params.epoch && !Number.isNaN(epoch)) {
    redirect(PagePath.Tournament);
  }

  const shareImage = await generateShareImage(params);

  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1168px] mx-auto'>
      <PenumbraWaves />
      <img src={shareImage} alt='Tournament Share Image' className='w-[512px] h-[512px]' />
    </section>
  );
}
