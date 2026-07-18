import { partIconPaths } from './partIconPaths';
import { TintWindow } from './tintTypes';

export type TintIconDef = {
  d: string;
  viewBox: string;
  accent?: 'ppf' | 'tint';
  ppfKind?: 'headlight' | 'taillight' | 'strip';
};

export const tintIconPaths: Record<TintWindow, TintIconDef> = {
  windscreenStrip: {
    d: 'M 6,10 L 94,10 L 92,20 L 8,20 Z',
    viewBox: '0 0 100 30',
    accent: 'ppf',
    ppfKind: 'strip',
  },
  leftHeadlight: {
    ...partIconPaths.leftHeadlight,
    accent: 'ppf',
    ppfKind: 'headlight',
  },
  rightHeadlight: {
    ...partIconPaths.rightHeadlight,
    accent: 'ppf',
    ppfKind: 'headlight',
  },
  leftTaillight: {
    ...partIconPaths.leftTaillight,
    accent: 'ppf',
    ppfKind: 'taillight',
  },
  rightTaillight: {
    ...partIconPaths.rightTaillight,
    accent: 'ppf',
    ppfKind: 'taillight',
  },
  frontLeft: {
    d: 'M 47.8,44.1 L 70.5,45.6 L 71.5,39.2 L 63.7,33.8 L 59.5,32.4 L 50.2,31.4 L 46.8,31.2 L 44.4,31.4 Z',
    viewBox: '42 30 32 18',
    accent: 'tint',
  },
  frontRight: {
    d: 'M 47.8,44.1 L 70.5,45.6 L 71.5,39.2 L 63.7,33.8 L 59.5,32.4 L 50.2,31.4 L 46.8,31.2 L 44.4,31.4 Z',
    viewBox: '42 30 32 18',
    accent: 'tint',
  },
  rearLeft: {
    d: 'M 38.8,30.7 L 26.6,31.4 L 22.4,31.7 L 12.0,38.0 L 7.8,41.9 L 7.6,43.1 L 40.2,44.8 Z',
    viewBox: '6 29 36 17',
    accent: 'tint',
  },
  rearRight: {
    d: 'M 38.8,30.7 L 26.6,31.4 L 22.4,31.7 L 12.0,38.0 L 7.8,41.9 L 7.6,43.1 L 40.2,44.8 Z',
    viewBox: '6 29 36 17',
    accent: 'tint',
  },
  rearWindow: {
    d: 'M 17.7,16.3 L 15.7,17.9 L 14.1,20.6 L 13.2,24.4 L 13.0,27.3 L 16.1,28.5 L 20.2,29.4 L 24.3,29.2 L 28.9,28.9 L 41.1,29.2 L 60.5,29.2 L 73.2,29.4 L 80.5,28.2 L 81.6,26.4 L 80.9,22.8 L 80.2,18.5 L 77.7,16.4 L 72.3,14.8 L 64.5,14.2 L 47.5,14.2 L 38.0,14.8 L 27.5,14.8 L 25.2,15.3 Z',
    viewBox: '12 13 72 18',
    accent: 'tint',
  },
};
