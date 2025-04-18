import { theme } from '@penumbra-zone/ui/theme';

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
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  canvas.width = dpi(canvasWidth);
  canvas.height = dpi(canvasHeight);
  ctx.scale(scale, scale);
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
