import { RoundStatus } from "@prisma/client";
import { prisma } from "../../startup/prisma.js";
import logger from "../../startup/logger.js";
import { gameConfigs } from "../registry.js";
import { ensureOpenRound, settleRound } from "./round.service.js";

const TICK_MS = 1000;

export function startGameScheduler(): void {
  setInterval(() => {
    void tick().catch((err) =>
      logger.error({ err }, "game scheduler tick failed"),
    );
  }, TICK_MS);
}

async function tick(): Promise<void> {
  const now = new Date();

  for (const config of gameConfigs) {
    await ensureOpenRound(config);

    await prisma.round.updateMany({
      where: {
        gameType: config.gameType,
        status: RoundStatus.OPEN,
        locksAt: { lte: now },
      },
      data: { status: RoundStatus.LOCKED },
    });

    const toSettle = await prisma.round.findMany({
      where: {
        gameType: config.gameType,
        status: RoundStatus.LOCKED,
        settlesAt: { lte: now },
      },
    });

    for (const round of toSettle) {
      try {
        await settleRound(round.id, config);
      } catch (error) {
        logger.error(
          { err: error, roundId: round.id },
          "settleRound failed — may retry next tick",
        );
      }
    }
  }
}
