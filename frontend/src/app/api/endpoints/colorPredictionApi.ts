import { apiFetch } from "../http";

export type ColorRoundBet = { amount: unknown; pick: string };

export type ColorRound = {
  id: string;
  gameType: string;
  status: "OPEN" | "LOCKED" | "SETTLED";
  outcome: string | null;
  serverSeedHash: string;
  serverSeed: string | null;
  opensAt: string;
  locksAt: string;
  settlesAt: string;
  createdAt: string;
  bets?: ColorRoundBet[];
};

export type ColorHistoryRow = {
  id: string;
  outcome: string | null;
  settlesAt: string;
  serverSeed: string | null;
  serverSeedHash: string;
};

export type ColorMyBetRow = {
  id: string;
  roundId?: string;
  pick: string;
  amount: unknown;
  payout: unknown | null;
  won: boolean | null;
  createdAt: string;
  round: {
    outcome: string | null;
    status: string;
  };
};

export function getColorPredictionRound(): Promise<ColorRound | null> {
  return apiFetch("/games/color-prediction/round");
}

export function postColorPredictionBet(
  token: string,
  body: { pick: string; amount: number },
): Promise<unknown> {
  return apiFetch("/games/color-prediction/bet", {
    method: "POST",
    json: body,
    token,
  });
}

export function getColorPredictionHistory(): Promise<ColorHistoryRow[]> {
  return apiFetch("/games/color-prediction/history");
}

export function getColorPredictionMyBets(
  token: string,
): Promise<ColorMyBetRow[]> {
  return apiFetch("/games/color-prediction/my-bets", { method: "GET", token });
}
