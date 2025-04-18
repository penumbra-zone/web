import { theme } from '@penumbra-zone/ui/theme';
import { registerFont } from 'canvas';
import { join } from 'path';

export const scale = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

export const dpi = (px: number) => px * scale;

export const remToPx = (r: string) =>
  parseFloat(r) *
  parseFloat(
    typeof window !== 'undefined' ? getComputedStyle(document.documentElement).fontSize : '16px',
  );

export const scaleCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  ctx.scale(scale, scale);
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  canvas.width = dpi(canvasWidth);
  canvas.height = dpi(canvasHeight);
};

export function drawText(
  ctx: CanvasRenderingContext2D,
  {
    text,
    x = 'center',
    y = 0,
    color = theme.color.text.primary,
    fontSize = '1rem',
    fontFamily = theme.font.default,
    weight = 500,
  }: {
    text: string;
    x?: number | 'center';
    y?: number;
    color?: string;
    fontSize?: string;
    fontFamily?: string;
    weight?: number;
  },
) {
  ctx.save();
  ctx.font = `${weight} ${dpi(remToPx(fontSize))}px ${fontFamily}`;

  let xPos: number;
  if (x === 'center') {
    const textWidth = Math.ceil(ctx.measureText(text).width);
    xPos = ctx.canvas.width / 2 - textWidth / 2;
  } else {
    xPos = x;
  }

  ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  ctx.fillText(text, xPos, dpi(y));
  ctx.restore();
}

export function getTextWidth(
  ctx: CanvasRenderingContext2D,
  {
    text,
    fontSize = '1rem',
    fontFamily = theme.font.default,
    weight = 500,
  }: {
    text: string;
    fontSize?: string;
    fontFamily?: string;
    weight?: number;
  },
) {
  ctx.save();
  ctx.font = `${weight} ${dpi(remToPx(fontSize))}px ${fontFamily}`;
  const width = Math.ceil(ctx.measureText(text).width);
  ctx.restore();
  return width;
}

export function registerFonts() {
  if (typeof window === 'undefined') {
    const fontsDir = join(
      process.cwd(),
      'node_modules',
      '@penumbra-zone',
      'ui',
      'src',
      'theme',
      'fonts',
    );
    registerFont(join(fontsDir, 'IosevkaTerm-Regular.woff2'), { family: 'Iosevka Term' });
    registerFont(join(fontsDir, 'Poppins-Bold.woff2'), { family: 'Poppins', weight: 'bold' });
    registerFont(join(fontsDir, 'Poppins-Medium.woff2'), { family: 'Poppins', weight: 'medium' });
    registerFont(join(fontsDir, 'Poppins-Regular.woff2'), { family: 'Poppins' });
  }
}
