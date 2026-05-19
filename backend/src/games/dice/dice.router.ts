import { Router } from "express";
import { HttpError } from "../../errors/httpError.js";
import { placeBet } from "../engine/bet.service.js";
import { getCurrentRound, getHistory, getMyBets } from "../engine/query.service.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { diceConfig } from "./dice.config.js";

const router = Router();

router.get("/round", async (_req, res, next) => {
  try {
    const round = await getCurrentRound(diceConfig.gameType);
    res.json(round);
  } catch (e) {
    next(e);
  }
});

router.post("/bet", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { pick, amount } = req.body as { pick?: string; amount?: unknown };
    if (pick === undefined || amount === undefined) {
      throw new HttpError(400, "pick and amount required");
    }
    const amt = typeof amount === "number" ? amount : Number(amount);
    const bet = await placeBet(userId, pick, amt, diceConfig);
    res.json(bet);
  } catch (e) {
    next(e);
  }
});

router.get("/history", async (_req, res, next) => {
  try {
    const history = await getHistory(diceConfig.gameType);
    res.json(history);
  } catch (e) {
    next(e);
  }
});

router.get("/my-bets", authMiddleware, async (req, res, next) => {
  try {
    const bets = await getMyBets(req.user!.id, diceConfig.gameType);
    res.json(bets);
  } catch (e) {
    next(e);
  }
});

export default router;
