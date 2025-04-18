import { NextRequest, NextResponse } from 'next/server';
import { createCanvas } from 'canvas';
import { drawTournamentEarningsCanvas } from '@/pages/tournament/ui/shared/tournament-earnings-canvas';
import { registerFonts } from '@/shared/ui/canvas-toolkit';
import { TournamentParams, queryParamMap } from '@/pages/tournament/ui/join/page';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const params = Object.entries(queryParamMap).reduce(
    (acc, [shortKey, paramKey]) => ({
      ...acc,
      [paramKey]: searchParams.get(shortKey) ?? '',
    }),
    {},
  ) as TournamentParams;

  registerFonts();
  const canvas = createCanvas(1200, 630);
  await drawTournamentEarningsCanvas(canvas as unknown as HTMLCanvasElement, params);

  const buffer = canvas.toBuffer('image/png');

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
