import { dpi, drawText, getTextWidth, scaleCanvas } from '@/shared/ui/canvas-toolkit';
import { theme } from '@penumbra-zone/ui/theme';
import { TournamentParams } from './types';
import { pnum } from '@penumbra-zone/types/pnum';
import { shortify } from '@penumbra-zone/types/shortify';

const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';

export async function renderTournamentEarningsCanvas(
  canvas: HTMLCanvasElement,
  params: TournamentParams,
  exponent: number,
  size: { width: number; height: number },
) {
  const ctx = canvas.getContext('2d');
  const { epoch, earnings, votingStreak, incentivePool, lpPool, delegatorPool } = params;
  if (!ctx) {
    console.error('Failed to get canvas context');
    return;
  }

  const landscape = size.width > size.height;

  const format = (value: string) => {
    if (!value) {
      return '-';
    }
    const [num, unit] = value.split(':');
    const amount = pnum(BigInt(Number(num)), { exponent });

    // perhaps improve upon this later on
    // for now just making sure the value stays inside the boxes
    if (amount.toNumber() > 999999) {
      return `${shortify(amount.toNumber())} ${unit}`;
    }

    return `${Number(amount.toNumber()).toLocaleString()} ${unit}`;
  };

  scaleCanvas(canvas, size);
  function draw(bgImage: CanvasImageSource) {
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    drawText(ctx, {
      text: landscape ? `Tournament #${epoch}` : `Liquidity Tournament #${epoch}`,
      y: landscape ? 34 : 60,
      fontSize: theme.fontSize.textSm,
      fontFamily: theme.font.mono,
    });

    drawText(ctx, {
      text: "You've Earned",
      y: landscape ? 90 : 172,
      fontSize: theme.fontSize.text3xl,
      fontFamily: theme.font.heading,
      gradient: {
        startColor: theme.color.primary.light,
        endColor: theme.color.secondary.light,
      },
    });

    drawText(ctx, {
      text: format(earnings),
      y: landscape ? 120 : 220,
      fontSize: theme.fontSize.text6xl,
      fontFamily: theme.font.heading,
    });

    const boxesWidth = landscape ? dpi(316) : dpi(440);
    const noOfBoxes = 4;
    const boxesPadding = landscape ? dpi(142) : dpi(36);
    const singleBoxWidth = boxesWidth / noOfBoxes;

    const boxData = [
      {
        heading: 'Voting Streak',
        value: format(votingStreak),
        color: theme.color.text.primary,
      },
      {
        heading: 'Incentive Pool',
        value: format(incentivePool),
        gradient: {
          startColor: theme.color.primary.light,
          endColor: theme.color.secondary.light,
        },
      },
      { heading: 'LP Pool', value: format(lpPool), color: theme.color.primary.light },
      {
        heading: 'Delegator Pool',
        value: format(delegatorPool),
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
    ? `${baseUrl}/assets/lqt-social-rewards-bg-landscape.jpg`
    : `${baseUrl}/assets/lqt-social-rewards-bg-square.jpg`;

  if (typeof window !== 'undefined') {
    const bgImage = new Image();
    bgImage.src = bgImageSrc;
    bgImage.onload = () => draw(bgImage);
  } else {
    await import('canvas').then(async ({ loadImage }) => {
      await loadImage(bgImageSrc)
        .then(bgImage => {
          draw(bgImage as unknown as CanvasImageSource);
        })
        .catch((err: unknown) => {
          console.error('Failed to load image', err);
        });
    });
  }
}
