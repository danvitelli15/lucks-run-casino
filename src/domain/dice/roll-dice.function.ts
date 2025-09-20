import type { Die } from "./dice.types";

export const roll = (quantity: number, sides: Die): number[] => {
  const rolls: number[] = [];
  for (let i = 0; i < quantity; i++) {
    rolls.push(Math.ceil(Math.random() * sides));
  }
  return rolls;
};
