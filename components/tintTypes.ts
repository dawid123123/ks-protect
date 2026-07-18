export type TintLevel = 5 | 15 | 25 | 50;

export type TintWindow =
  | 'windscreenStrip'
  | 'frontLeft'
  | 'frontRight'
  | 'leftHeadlight'
  | 'rightHeadlight'
  | 'leftTaillight'
  | 'rightTaillight'
  | 'rearLeft'
  | 'rearRight'
  | 'rearWindow';

export type TintLineSelection = {
  level: TintLevel;
  qty: number;
};

export type TintSelection = Partial<Record<TintWindow, TintLineSelection>>;

export type TintPpfZone =
  | 'windscreenStrip'
  | 'leftHeadlight'
  | 'rightHeadlight'
  | 'leftTaillight'
  | 'rightTaillight';

/** @deprecated Use TintPpfZone */
export type FrontPpfZone = TintPpfZone;

export const lockedTintPpfZones: TintPpfZone[] = [];

/** @deprecated Use lockedTintPpfZones */
export const lockedFrontPpfZones = lockedTintPpfZones;

export type TintPpfSelection = Partial<Record<TintPpfZone, true>>;

/** @deprecated Use TintPpfSelection */
export type FrontPpfSelection = TintPpfSelection;

export type TintVehicleId =
  | 'gle'
  | 'cla'
  | 'cclass'
  | 'eclass'
  | 'gclass'
  | 'amggt';

export type TintView = 'front' | 'side' | 'rear';
