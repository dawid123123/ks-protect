/**
 * KS Protect - all configurator prices (ISK).
 * Edit values here; PPF and Tint read from this file.
 */

/** PPF part prices (per panel / zone). */
export const ppfPartPrices = {
  hood: 109900,
  roof: 89900,
  rearWindow: 44900,
  frontBumper: 89900,
  rearBumper: 89900,
  frontLip: 44900,
  leftHeadlight: 29900,
  rightHeadlight: 29900,
  leftMirror: 19900,
  rightMirror: 19900,
  leftFender: 59900,
  rightFender: 59900,
  frontDoor: 69900,
  rearDoor: 69900,
  sideSkirt: 49900,
  splashGuard: 44900,
  rightSplashGuard: 44900,
  frontDoorLower: 44900,
  rightFrontDoorLower: 44900,
  rearDoorLower: 44900,
  rightRearDoorLower: 44900,
  frontWheelArch: 44900,
  rearWheelArch: 44900,
  rightFrontWheelArch: 44900,
  rightRearWheelArch: 44900,
  leftRearQuarter: 59900,
  rightRearQuarter: 59900,
  tailgate: 79900,
  leftTaillight: 29900,
  rightTaillight: 29900,
  leftAPillar: 24900,
  rightAPillar: 24900,
  leftBPillar: 29900,
  rightBPillar: 29900,
  leftCPillar: 24900,
  rightCPillar: 24900,
} as const;

/** Tint install base prices (GLE/SUV reference). */
export const tintWindowBasePrices = {
  windscreenStrip: 14900,
  frontLeft: 19900,
  frontRight: 19900,
  leftHeadlight: 0,
  rightHeadlight: 0,
  leftTaillight: 0,
  rightTaillight: 0,
  rearLeft: 17900,
  rearRight: 17900,
  rearWindow: 27900,
} as const;

export const tintLevelMultipliers = {
  5: 1.12,
  15: 1.06,
  25: 1,
  50: 0.95,
} as const;

export const tintVehicleSizeMultipliers = {
  gle: 1,
  cla: 0.92,
  cclass: 0.94,
  eclass: 0.96,
  gclass: 1.14,
  amggt: 0.9,
} as const;

/** Dark PPF zones on the tint configurator. */
export const tintPpfBasePrices = {
  windscreenStrip: 44900,
  leftHeadlight: 29900,
  rightHeadlight: 29900,
  leftTaillight: 29900,
  rightTaillight: 29900,
} as const;

/** Static price guide tiles on /tint. */
export const tintPriceGuideAmounts = {
  small: 10000,
  large: 25000,
  dechrome: 130000,
} as const;
