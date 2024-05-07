export interface ManifestData {
  description: string;
  key: string;
  name: string;
  short_name?: string;
  version: string;
  icons: ManifestIcons;
}

export interface ManifestIcons {
  [k: number]: string;
  '128': string;
}

const isManifestIcons = (icons: unknown): icons is ManifestIcons =>
  !(
    icons != null &&
    typeof icons === 'object' &&
    Object.keys(icons).every(k => typeof k === 'string' && !isNaN(Number(k))) &&
    '128' in icons
  );

export const isPenumbraManifest = (o: Partial<ManifestData>): o is ManifestData =>
  typeof o.description === 'string' &&
  typeof o.key === 'string' &&
  typeof o.name === 'string' &&
  typeof o.version === 'string' &&
  (o.short_name == null || typeof o.short_name === 'string') &&
  !isManifestIcons(o.icons);
