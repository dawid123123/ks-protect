import { TintView, TintWindow } from './tintTypes';

export type TintZoneMode = 'tint' | 'ppf' | 'blocked';

export type TintPhotoZone = {
  window: TintWindow;
  label: string;
  d: string;
  mode?: TintZoneMode;
  ppfLocked?: boolean;
  fillRule?: 'evenodd' | 'nonzero';
};

export const tintFrontZones: TintPhotoZone[] = [
  {
    window: 'windscreenStrip',
    label: 'WINDSCREEN STRIP',
    mode: 'ppf',
    d: 'M 27.9,19.6 L 25.1,25.6 L 23.8,29.0 L 22.8,32.2 L 24.5,33.7 L 27.9,33.7 L 35.1,33.7 L 46.0,33.9 L 56.2,33.7 L 65.1,33.9 L 73.8,34.1 L 78.5,34.5 L 74.9,26.9 L 72.3,22.0 L 71.3,19.4 Z',
  },
  {
    window: 'leftHeadlight',
    label: 'LEFT HEADLIGHT',
    mode: 'ppf',
    d: 'M 16.4,45.4 L 14.5,46.9 L 14.3,50.5 L 14.9,52.4 L 16.6,52.6 L 20.2,53.0 L 24.0,53.2 L 26.2,52.8 L 27.0,50.9 L 28.1,49.4 L 28.5,48.4 Z',
  },
  {
    window: 'rightHeadlight',
    label: 'RIGHT HEADLIGHT',
    mode: 'ppf',
    d: 'M 73.6,48.2 L 75.1,51.2 L 76.4,53.6 L 78.9,53.8 L 80.9,54.0 L 83.4,54.0 L 85.5,53.6 L 86.4,52.9 L 87.0,51.4 L 87.0,49.7 L 87.0,47.8 L 86.4,46.1 L 85.3,45.3 Z',
  },
];

export const tintSideZones: TintPhotoZone[] = [
  {
    window: 'frontLeft',
    label: 'FRONT WINDOW',
    mode: 'tint',
    d: 'M 47.8,44.1 L 70.5,45.6 L 71.5,39.2 L 63.7,33.8 L 59.5,32.4 L 50.2,31.4 L 46.8,31.2 L 44.4,31.4 Z',
  },
  {
    window: 'rearLeft',
    label: 'REAR WINDOW',
    mode: 'tint',
    d: 'M 38.8,30.7 L 26.6,31.4 L 22.4,31.7 L 12.0,38.0 L 7.8,41.9 L 7.6,43.1 L 40.2,44.8 Z',
  },
];

export const tintRearZones: TintPhotoZone[] = [
  {
    window: 'rearWindow',
    label: 'REAR WINDOW',
    mode: 'tint',
    d: 'M 17.7,16.3 L 15.7,17.9 L 14.1,20.6 L 13.2,24.4 L 13.0,27.3 L 16.1,28.5 L 20.2,29.4 L 24.3,29.2 L 28.9,28.9 L 41.1,29.2 L 60.5,29.2 L 73.2,29.4 L 80.5,28.2 L 81.6,26.4 L 80.9,22.8 L 80.2,18.5 L 77.7,16.4 L 72.3,14.8 L 64.5,14.2 L 47.5,14.2 L 38.0,14.8 L 27.5,14.8 L 25.2,15.3 Z',
  },
  {
    window: 'leftTaillight',
    label: 'LEFT TAILLIGHT',
    mode: 'ppf',
    d: 'M 28.0,41.8 L 18.4,46.3 L 9.8,47.7 L -0.7,48.4 L -5.2,49.0 L -6.1,45.9 L -5.5,41.5 L -2.7,37.2 L 9.5,39.7 Z',
  },
  {
    window: 'rightTaillight',
    label: 'RIGHT TAILLIGHT',
    mode: 'ppf',
    d: 'M 68.6,42.0 L 72.5,44.7 L 85.7,47.2 L 91.4,47.7 L 100.5,48.4 L 101.8,48.4 L 100.7,42.0 L 98.2,37.4 L 97.0,36.5 L 86.4,40.2 Z',
  },
];

export const tintViewZones: Record<TintView, TintPhotoZone[]> = {
  front: tintFrontZones,
  side: tintSideZones,
  rear: tintRearZones,
};

export const tintViewWindows: Record<TintView, TintWindow[]> = {
  front: ['windscreenStrip', 'leftHeadlight', 'rightHeadlight'],
  side: ['frontLeft', 'rearLeft'],
  rear: ['rearWindow', 'leftTaillight', 'rightTaillight'],
};

export const tintZoneSnippetNames: Record<TintView, string> = {
  front: 'tintFrontZones',
  side: 'tintSideZones',
  rear: 'tintRearZones',
};

export const tintViewLabels: Record<TintView, string> = {
  front: 'FRONT VIEW',
  side: 'SIDE VIEW',
  rear: 'REAR VIEW',
};
