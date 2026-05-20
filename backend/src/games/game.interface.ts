import type { GameType } from "@prisma/client";

export interface GameConfig {
  gameType: GameType;
  /** Seconds betting open; then locked window before settle. */
  roundDuration: { open: number; locked: number };
  deriveOutcome: (serverSeed: string, roundId: string) => string;
  getMultiplier: (pick: string) => number;
  validatePick: (pick: string) => boolean;
  /** Normalize pick before DB storage + settle compare (e.g. RED/BLUE). */
  normalizePick?: (pick: string) => string;
}
