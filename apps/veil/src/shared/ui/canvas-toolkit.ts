import { theme } from '@penumbra-zone/ui/theme';
import { registerFont } from 'canvas';
import path from 'path';

export const scale = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 2;

/** convert CSS px → device-pixel px */
export const dpi = (px: number) => px * scale;

/** convert REM → CSS px */
export const remToPx = (rem: string) =>
  parseFloat(rem) *
  parseFloat(
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement).fontSize
      : '11px',
  );

/** Hi-DPI helper: enlarge the bitmap, keep the element the same size. */
export function scaleCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // --- 1. read the *layout* size (CSS px) -------------------------------
  const { width: cssW, height: cssH } = canvas.getBoundingClientRect();

  // --- 2. set bitmap resolution -----------------------------------------
  canvas.width  = cssW * scale;       // e.g. 512 × 2 = 1024
  canvas.height = cssH * scale;

  // --- 3. keep the element’s CSS box unchanged --------------------------
  canvas.style.width  = `${cssW}px`;
  canvas.style.height = `${cssH}px`;

  // --- 4. map user space → CSS px ---------------------------------------
  ctx.scale(scale, scale);
}

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
    gradient,
  }: {
    text: string;
    x?: number | 'center';
    y?: number;
    color?: string;
    fontSize?: string;
    fontFamily?: string;
    weight?: number;
    gradient?: {
      startColor: string;
      endColor: string;
    };
  },
) {
  ctx.save();
  ctx.font = `${weight} ${dpi(remToPx(fontSize))}px ${fontFamily}`;

  let xPos: number;
  const textWidth = Math.ceil(ctx.measureText(text).width);
  if (x === 'center') {
    xPos = ctx.canvas.width / 2 - textWidth / 2;
  } else {
    xPos = x;
  }

  ctx.textBaseline = 'top';

  if (gradient) {
    const grd = ctx.createLinearGradient(xPos, 0, xPos + textWidth, 0);
    grd.addColorStop(0, gradient.startColor);
    grd.addColorStop(1, gradient.endColor);
    ctx.fillStyle = grd;
  } else {
    ctx.fillStyle = color;
  }

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
    try {
      function findVeilRoot(startPath: string) {
        const parts = path.resolve(startPath).split(path.sep);

        const index = parts.lastIndexOf('veil');
        if (index === -1) {
          throw new Error(`Directory "veil" not found in path: ${startPath}`);
        }

        return parts.slice(0, index + 1).join(path.sep);
      }

      const fontsDir = `${findVeilRoot(process.cwd())}/public/assets/fonts`;
      const resolveFont = (font: string) => `${fontsDir}/${font}`;

      registerFont(resolveFont('SGr-IosevkaTerm-Medium.ttc'), {
        family: 'Iosevka Term',
        weight: 'medium',
      });
      registerFont(resolveFont('SGr-IosevkaTerm-Regular.ttc'), {
        family: 'Iosevka Term',
        weight: 'normal',
      });
      registerFont(resolveFont('Poppins-Medium.ttf'), { family: 'Poppins' });
      registerFont(resolveFont('WorkSans-Medium.ttf'), {
        family: 'Work Sans',
      });
    } catch (e) {
      console.error('__dirname', __dirname);
      console.error('Error registering fonts', e);
    }
  }
}
