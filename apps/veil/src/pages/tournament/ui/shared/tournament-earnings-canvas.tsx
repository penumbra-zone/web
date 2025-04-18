import {
  dpi,
  drawText,
  getTextWidth,
  scaleCanvas,
  registerFonts,
} from '@/shared/ui/canvas-toolkit';
import { theme } from '@penumbra-zone/ui/theme';
import { TournamentParams } from '@/pages/tournament/ui/join/page';

const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';

export async function drawTournamentEarningsCanvas(
  canvas: HTMLCanvasElement,
  { epoch, earnings, votingStreak, incentivePool, lpPool, delegatorPool }: TournamentParams,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get canvas context');
    return;
  }

  scaleCanvas(canvas);
  function draw(bgImage: CanvasImageSource) {
    if (!ctx) {
      console.error('Canvas context is null in draw function');
      return;
    }

    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    drawText(ctx, {
      text: `Liquidity Tournament #${epoch}`,
      y: 60,
      fontSize: theme.fontSize.textSm,
      fontFamily: theme.font.mono,
    });

    drawText(ctx, {
      text: "You've Earned",
      y: 172,
      fontSize: theme.fontSize.text3xl,
    });

    drawText(ctx, {
      text: earnings.split(':').join(' '),
      y: 220,
      fontSize: theme.fontSize.text6xl,
    });

    const boxesWidth = dpi(440);
    const noOfBoxes = 4;
    const boxesPadding = dpi(36);
    const singleBoxWidth = boxesWidth / noOfBoxes;

    const boxData = [
      { heading: 'Voting Streak', value: votingStreak.split(':').join(' ') },
      { heading: 'Incentive Pool', value: incentivePool.split(':').join(' ') },
      { heading: 'LP Pool', value: lpPool.split(':').join(' ') },
      { heading: 'Delegator Pool', value: delegatorPool.split(':').join(' ') },
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
        color: theme.color.primary.light,
      };

      const xPos = boxesPadding + singleBoxWidth * index + singleBoxWidth / 2;

      drawText(ctx, {
        x: xPos - getTextWidth(ctx, headingProps) / 2,
        y: 300,
        ...headingProps,
      });

      drawText(ctx, {
        x: xPos - getTextWidth(ctx, valueProps) / 2,
        y: 317,
        ...valueProps,
      });
    });
  }

  const bgImageSrc = `${baseUrl}/assets/lqt-social-rewards-bg.png`;
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
