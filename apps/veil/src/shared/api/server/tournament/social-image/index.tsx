import { NextRequest, NextResponse } from 'next/server';
import { createCanvas } from 'canvas';
import { drawTournamentEarningsCanvas } from '@/pages/tournament/ui/shared/tournament-earnings-canvas';
import { registerFonts } from '@/shared/ui/canvas-toolkit';
import { TournamentParams } from '@/pages/tournament/ui/join/page';

const queryParamMap = {
  t: 'epoch',
  e: 'earnings',
  v: 'votingStreak',
  i: 'incentivePool',
  l: 'lpPool',
  d: 'delegatorPool',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  console.log('TCL: GET -> searchParams', searchParams);
  console.log('TCL: GET -> searchParams', searchParams.get('t'));
  console.log('TCL: GET -> queryParamMap', queryParamMap);
  const params = Object.entries(queryParamMap).reduce(
    (acc, [shortKey, paramKey]) => ({
      ...acc,
      [paramKey]: searchParams.get(shortKey) ?? shortKey,
    }),
    {},
  ) as TournamentParams;
  console.log('TCL: GET -> params', params);

  registerFonts();
  // const canvas = createCanvas(1200, 630);
  const canvas = createCanvas(600, 315);
  await drawTournamentEarningsCanvas(canvas as unknown as HTMLCanvasElement, params, true);

  return new NextResponse(canvas.toBuffer('image/png'), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
