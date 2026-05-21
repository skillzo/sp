import { apiFetch } from "../http";

export type WheelSpinResult = {
  betId: string;
  roundId: string;
  pick: string;
  segments: number;
  segmentIndex: number;
  multiplier: number;
  amount: string;
  won: boolean;
  payout: string;
  profit: string;
  serverSeed: string;
  serverSeedHash: string;
  outcome: string;
  settlesAt: string;
};

export type WheelMyBetRow = {
  id: string;
  pick: string;
  amount: unknown;
  payout: unknown | null;
  won: boolean | null;
  multiplier: unknown;
  createdAt: string;
  round: {
    outcome: string | null;
    status: string;
    serverSeed: string | null;
    serverSeedHash: string;
    settlesAt: string;
  };
};

export type WheelConfig = {
  defaultSegments: number;
  segmentOptions: number[];
  tiers: Array<{ pick: string; multiplier: number; winChance: number }>;
};

export function getWheelConfig(): Promise<WheelConfig> {
  return apiFetch("/games/wheel/config");
}

export function postWheelSpin(
  token: string,
  body: { pick: string; amount: number; segments?: number },
): Promise<WheelSpinResult> {
  return apiFetch("/games/wheel/spin", {
    method: "POST",
    json: body,
    token,
  });
}

export function getWheelMyBets(token: string): Promise<WheelMyBetRow[]> {
  return apiFetch("/games/wheel/my-bets", { method: "GET", token });
}
