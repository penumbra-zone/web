import { dpi, drawText, getTextWidth, scaleCanvas } from '@/shared/ui/canvas-toolkit';
import { theme } from '@penumbra-zone/ui/theme';
import { TournamentParams } from '@/pages/tournament/ui/join/page';

const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';

export async function drawTournamentEarningsCanvas(
  canvas: HTMLCanvasElement,
  params: TournamentParams,
  landscape = false,
) {
  const ctx = canvas.getContext('2d');
  const { epoch, earnings, votingStreak, incentivePool, lpPool, delegatorPool } = params;
  console.log('TCL: params', params);
  if (!ctx) {
    console.error('Failed to get canvas context');
    return;
  }

  scaleCanvas(canvas);
  function draw(bgImage: CanvasImageSource) {
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    drawText(ctx, {
      text: `Liquidity Tournament #${epoch}`,
      y: landscape ? 34 : 60,
      fontSize: theme.fontSize.textSm,
      fontFamily: theme.font.mono,
    });

    drawText(ctx, {
      text: "You've Earned",
      y: landscape ? 90 : 172,
      fontSize: theme.fontSize.text3xl,
      gradient: {
        startColor: theme.color.primary.light,
        endColor: theme.color.secondary.light,
      },
    });

    drawText(ctx, {
      text: earnings.split(':').join(' '),
      y: landscape ? 120 : 220,
      fontSize: theme.fontSize.text6xl,
    });

    const boxesWidth = landscape ? dpi(316) : dpi(440);
    const noOfBoxes = 4;
    const boxesPadding = landscape ? dpi(142) : dpi(36);
    const singleBoxWidth = boxesWidth / noOfBoxes;

    const boxData = [
      {
        heading: 'Voting Streak',
        value: votingStreak.split(':').join(' '),
        color: theme.color.text.primary,
      },
      {
        heading: 'Incentive Pool',
        value: incentivePool.split(':').join(' '),
        gradient: {
          startColor: theme.color.primary.light,
          endColor: theme.color.secondary.light,
        },
      },
      { heading: 'LP Pool', value: lpPool.split(':').join(' '), color: theme.color.primary.light },
      {
        heading: 'Delegator Pool',
        value: delegatorPool.split(':').join(' '),
        color: theme.color.secondary.light,
      },
    ];

    boxData.forEach((box, index) => {
      const headingProps = {
        text: box.heading,
        fontSize: theme.fontSize.textXs,
        fontFamily: theme.font.mono,
        color: theme.color.text.secondary,
      };
      const valueProps = {
        text: box.value,
        fontSize: theme.fontSize.textBase,
        fontFamily: theme.font.mono,
        weight: 400,
        color: box.color,
        gradient: box.gradient,
      };

      const xPos = boxesPadding + singleBoxWidth * index + singleBoxWidth / 2;

      drawText(ctx, {
        x: xPos - getTextWidth(ctx, headingProps) / 2,
        y: landscape ? 184 : 300,
        ...headingProps,
      });

      drawText(ctx, {
        x: xPos - getTextWidth(ctx, valueProps) / 2,
        y: landscape ? 198 : 317,
        ...valueProps,
      });
    });
  }

  const bgImageSrc = landscape
    ? `${baseUrl}/assets/lqt-social-rewards-bg-landscape.png`
    : `${baseUrl}/assets/lqt-social-rewards-bg-square.png`;
  if (typeof window !== 'undefined') {
    const bgImage = new Image();
    bgImage.src = bgImageSrc;
    bgImage.onload = () => draw(bgImage);
  } else {
    await import('canvas').then(async ({ loadImage }) => {
      await loadImage(bgImageSrc).then(bgImage => {
        draw(bgImage as unknown as CanvasImageSource);
      });
    });
  }
}
