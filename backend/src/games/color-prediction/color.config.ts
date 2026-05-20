import { GameType } from "@prisma/client";
import { colorOutcome } from "../../utils/games.utils.js";
import type { GameConfig } from "../game.interface.js";

const PAYOUT_MULTIPLIER = 1.65;

function deriveOutcome(serverSeed: string, roundId: string): string {
  return colorOutcome(serverSeed, roundId);
}

function normalizePick(pick: string): string {
  return pick.trim().toUpperCase();
}

function getMultiplier(pick: string): number {
  if (!validatePick(pick)) return 0;
  return PAYOUT_MULTIPLIER;
}

function validatePick(pick: string): boolean {
  const p = normalizePick(pick);
  return p === "RED" || p === "BLUE";
}

export const colorPredictionConfig: GameConfig = {
  gameType: GameType.COLOR_PREDICTION,
  roundDuration: { open: 90, locked: 5 },
  deriveOutcome,
  getMultiplier,
  validatePick,
  normalizePick,
};
