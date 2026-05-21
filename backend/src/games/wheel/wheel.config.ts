import { GameType } from "@prisma/client";
import { wheelOutcome } from "../../utils/games.utils.js";

export const WHEEL_SEGMENT_OPTIONS = [50, 20] as const;
export const WHEEL_DEFAULT_SEGMENTS = 50;

export type WheelSegmentCount = (typeof WHEEL_SEGMENT_OPTIONS)[number];

const TIERS: Record<string, { multiplier: number; winChance: number }> = {
  "1.2": { multiplier: 1.2, winChance: 75 },
  "1.5": { multiplier: 1.5, winChance: 50 },
  "3.0": { multiplier: 3.0, winChance: 25 },
};

export function normalizeWheelPick(pick: string): string {
  const n = Number(pick.trim());
  if (n === 1.2) return "1.2";
  if (n === 1.5) return "1.5";
  if (n === 3) return "3.0";
  return pick.trim();
}

export function validateWheelPick(pick: string): boolean {
  return normalizeWheelPick(pick) in TIERS;
}

export function getWheelMultiplier(pick: string): number {
  const key = normalizeWheelPick(pick);
  return TIERS[key]?.multiplier ?? 0;
}

export function getWheelWinSegmentCount(
  pick: string,
  totalSegments: number,
): number {
  const key = normalizeWheelPick(pick);
  const chance = TIERS[key]?.winChance ?? 0;
  return Math.floor((chance / 100) * totalSegments);
}

/** Win segments are indices 0 … winCount−1 (deterministic layout). */
export function isWheelWin(
  pick: string,
  segmentIndex: number,
  totalSegments: number,
): boolean {
  return segmentIndex < getWheelWinSegmentCount(pick, totalSegments);
}

export function parseWheelSegments(raw: unknown): WheelSegmentCount {
  const n =
    raw === undefined || raw === null || raw === ""
      ? WHEEL_DEFAULT_SEGMENTS
      : typeof raw === "number"
        ? raw
        : Number(raw);

  if (n === 20 || n === 50) return n;
  throw new Error("Invalid segments");
}

export function deriveWheelSegmentIndex(
  serverSeed: string,
  roundId: string,
  totalSegments: number,
): number {
  return wheelOutcome(serverSeed, roundId, totalSegments);
}

export function formatWheelOutcome(
  segmentIndex: number,
  totalSegments: number,
): string {
  return `${segmentIndex}:${totalSegments}`;
}

export function parseWheelOutcome(outcome: string): {
  segmentIndex: number;
  totalSegments: number;
} | null {
  const [seg, total] = outcome.split(":");
  const segmentIndex = Number(seg);
  const totalSegments = Number(total);
  if (
    !Number.isInteger(segmentIndex) ||
    !Number.isInteger(totalSegments) ||
    segmentIndex < 0 ||
    totalSegments <= 0 ||
    segmentIndex >= totalSegments
  ) {
    return null;
  }
  return { segmentIndex, totalSegments };
}

export const wheelPublicConfig = {
  gameType: GameType.WHEEL,
  defaultSegments: WHEEL_DEFAULT_SEGMENTS,
  segmentOptions: [...WHEEL_SEGMENT_OPTIONS],
  tiers: Object.entries(TIERS).map(([pick, { multiplier, winChance }]) => ({
    pick,
    multiplier,
    winChance,
  })),
};
