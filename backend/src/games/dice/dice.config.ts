import { GameType } from "@prisma/client";
import { diceOutcome } from "../../utils/games.utils.js";
import type { GameConfig } from "../game.interface.js";

const MULTIPLIERS: Record<number, number> = {
  1: 5.0,
  2: 5.0,
  3: 5.0,
  4: 5.0,
  5: 5.0,
  6: 5.0,
};

function deriveOutcome(serverSeed: string, roundId: string): string {
  return String(diceOutcome(serverSeed, roundId));
}

function getMultiplier(pick: string): number {
  return MULTIPLIERS[Number(pick)] ?? 0;
}

function validatePick(pick: string): boolean {
  const n = Number(pick);
  return Number.isInteger(n) && n >= 1 && n <= 6;
}

export const diceConfig: GameConfig = {
  gameType: GameType.DICE,
  roundDuration: { open: 30, locked: 5 },
  deriveOutcome,
  getMultiplier,
  validatePick,
};
