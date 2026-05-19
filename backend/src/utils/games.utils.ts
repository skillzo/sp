import crypto from "crypto";

export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashServerSeed(serverSeed: string): string {
  return crypto.createHash("sha256").update(serverSeed).digest("hex");
}

/** First 8 hex chars of sha256 → uint32 space (0 … 0xffffffff). */
export function deriveOutcome(serverSeed: string, roundId: string): number {
  const hash = crypto
    .createHash("sha256")
    .update(`${serverSeed}:${roundId}`)
    .digest("hex");

  return parseInt(hash.slice(0, 8), 16);
}

export function colorOutcome(
  serverSeed: string,
  roundId: string,
): "RED" | "BLUE" {
  const n = deriveOutcome(serverSeed, roundId);
  return n % 2 === 0 ? "RED" : "BLUE";
}

export function diceOutcome(serverSeed: string, roundId: string): number {
  const n = deriveOutcome(serverSeed, roundId);
  return (n % 6) + 1;
}

/** 0-based segment index; map to labels in game config. */
export function wheelOutcome(
  serverSeed: string,
  roundId: string,
  totalSegments: number,
): number {
  const n = deriveOutcome(serverSeed, roundId);
  return n % totalSegments;
}
