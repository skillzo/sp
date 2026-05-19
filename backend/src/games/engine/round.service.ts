import { Prisma, RoundStatus } from "@prisma/client";
import { prisma } from "../../startup/prisma.js";
import logger from "../../startup/logger.js";
import { generateServerSeed, hashServerSeed } from "../../utils/games.utils.js";
import type { GameConfig } from "../game.interface.js";

export async function createRound(config: GameConfig) {
  const now = new Date();
  const opensAt = now;
  const serverSeed = generateServerSeed();
  const serverSeedHash = hashServerSeed(serverSeed);
  const locksAt = new Date(now.getTime() + config.roundDuration.open * 1000);
  const settlesAt = new Date(
    locksAt.getTime() + config.roundDuration.locked * 1000,
  );

  return prisma.round.create({
    data: {
      gameType: config.gameType,
      status: RoundStatus.OPEN,
      serverSeed,
      serverSeedHash,
      opensAt,
      locksAt,
      settlesAt,
    },
  });
}

/** If no OPEN/LOCKED round exists (e.g. first boot or failed chain), create one. */
export async function ensureOpenRound(config: GameConfig): Promise<void> {
  const active = await prisma.round.findFirst({
    where: {
      gameType: config.gameType,
      status: { in: [RoundStatus.OPEN, RoundStatus.LOCKED] },
    },
    orderBy: { opensAt: "desc" },
  });
  if (!active) {
    await createRound(config);
  }
}

export async function settleRound(
  roundId: string,
  config: GameConfig,
): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      const round = await tx.round.findFirst({
        where: { id: roundId, status: RoundStatus.LOCKED },
      });

      if (!round?.serverSeed) {
        return;
      }

      if (round.gameType !== config.gameType) {
        logger.warn(
          { roundId, expected: config.gameType, got: round.gameType },
          "settleRound gameType mismatch; skipping",
        );
        return;
      }

      const outcome = config.deriveOutcome(round.serverSeed, roundId);
      const bets = await tx.bet.findMany({ where: { roundId } });

      let totalBets = new Prisma.Decimal(0);
      let totalPayout = new Prisma.Decimal(0);

      for (const bet of bets) {
        const won = bet.pick === outcome;
        const payout = won
          ? new Prisma.Decimal(bet.amount.toString()).mul(bet.multiplier)
          : new Prisma.Decimal(0);

        await tx.bet.update({
          where: { id: bet.id },
          data: { won, payout },
        });

        if (won && payout.gt(0)) {
          await tx.user.update({
            where: { id: bet.userId },
            data: {
              gamingBalance: { increment: payout },
            },
          });
        }

        totalBets = totalBets.add(bet.amount);
        totalPayout = totalPayout.add(payout);
      }

      await tx.round.update({
        where: { id: roundId },
        data: {
          status: RoundStatus.SETTLED,
          outcome,
          serverSeed: round.serverSeed,
        },
      });

      await tx.houseLedger.create({
        data: {
          roundId,
          gameType: config.gameType,
          totalBets,
          totalPayout,
          houseProfit: totalBets.sub(totalPayout),
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 15000,
    },
  );

  try {
    await createRound(config);
  } catch (error) {
    logger.error(
      { err: error, gameType: config.gameType },
      "createRound after settle failed — run scheduler ensureOpenRound",
    );
  }
}
