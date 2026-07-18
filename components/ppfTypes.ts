export type CarType =
  | "hatchback"
  | "sedan"
  | "coupe"
  | "suv"
  | "gle"
  | "gclass";

export type Part =
  | "hood"
  | "bumper"
  | "leftFender"
  | "rightFender"
  | "leftDoor"
  | "rightDoor"
  | "roof";

export interface Prices {
  hood: number;
  bumper: number;
  leftFender: number;
  rightFender: number;
  leftDoor: number;
  rightDoor: number;
  roof: number;
}

export interface PackageData {
  title: string;
  description: string;
  price: number;
  parts: Part[];
}

export const PART_NAMES: Record<Part, string> = {
  hood: "Hood",
  bumper: "Front Bumper",
  leftFender: "Left Fender",
  rightFender: "Right Fender",
  leftDoor: "Left Door",
  rightDoor: "Right Door",
  roof: "Roof",
};