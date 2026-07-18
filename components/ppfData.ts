import { CarType, PackageData, Prices } from "./ppfTypes";

export const CAR_PRICES: Record<CarType, Prices> = {
  hatchback: {
    hood: 89900,
    bumper: 69900,
    leftFender: 49900,
    rightFender: 49900,
    leftDoor: 59900,
    rightDoor: 59900,
    roof: 69900,
  },

  sedan: {
    hood: 99900,
    bumper: 79900,
    leftFender: 59900,
    rightFender: 59900,
    leftDoor: 69900,
    rightDoor: 69900,
    roof: 79900,
  },

  coupe: {
    hood: 99900,
    bumper: 79900,
    leftFender: 59900,
    rightFender: 59900,
    leftDoor: 69900,
    rightDoor: 69900,
    roof: 79900,
  },

  suv: {
    hood: 109900,
    bumper: 89900,
    leftFender: 69900,
    rightFender: 69900,
    leftDoor: 79900,
    rightDoor: 79900,
    roof: 99900,
  },

  gle: {
    hood: 119900,
    bumper: 99900,
    leftFender: 79900,
    rightFender: 79900,
    leftDoor: 89900,
    rightDoor: 89900,
    roof: 109900,
  },

  gclass: {
    hood: 149900,
    bumper: 129900,
    leftFender: 99900,
    rightFender: 99900,
    leftDoor: 119900,
    rightDoor: 119900,
    roof: 139900,
  },
};

export const PACKAGES: PackageData[] = [
  {
    title: "Front Package",
    description: "Front bumper + Hood",
    price: 169900,
    parts: [
      "hood",
      "bumper",
    ],
  },

  {
    title: "Full Front",
    description: "Hood + Bumper + Both Fenders",
    price: 259900,
    parts: [
      "hood",
      "bumper",
      "leftFender",
      "rightFender",
    ],
  },

  {
    title: "Full Body",
    description: "Complete Vehicle Protection",
    price: 599900,
    parts: [
      "hood",
      "bumper",
      "leftFender",
      "rightFender",
      "leftDoor",
      "rightDoor",
      "roof",
    ],
  },
];

export const CAR_IMAGES: Record<CarType, string> = {
  hatchback: "/images/hatchback.png",
  sedan: "/images/sedan.png",
  coupe: "/images/coupe.png",
  suv: "/images/suv.png",
  gle: "/images/gle.png",
  gclass: "/images/gclass.png",
};