import { Router } from "express";
import { HttpError } from "../errors/httpError.js";
import {
  getWheelConfig,
  getWheelHistory,
  getWheelMyBets,
  placeWheelSpin,
} from "../games/engine/wheel.service.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/config", (_req, res) => {
  res.json(getWheelConfig());
});

router.post("/spin", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { pick, amount, segments } = req.body as {
      pick?: string;
      amount?: unknown;
      segments?: unknown;
    };
    if (pick === undefined || amount === undefined) {
      throw new HttpError(400, "pick and amount required");
    }
    const amt = typeof amount === "number" ? amount : Number(amount);
    const result = await placeWheelSpin(userId, pick, amt, segments);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get("/history", async (_req, res, next) => {
  try {
    const history = await getWheelHistory();
    res.json(history);
  } catch (e) {
    next(e);
  }
});

router.get("/my-bets", authMiddleware, async (req, res, next) => {
  try {
    const bets = await getWheelMyBets(req.user!.id);
    res.json(bets);
  } catch (e) {
    next(e);
  }
});

export default router;
