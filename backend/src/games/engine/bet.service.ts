import { GameType, Prisma, RoundStatus } from "@prisma/client";
import { HttpError } from "../../errors/httpError.js";
import { prisma } from "../../startup/prisma.js";
import type { GameConfig } from "../game.interface.js";

export async function placeBet(
  userId: string,
  pick: string,
  amount: number,
  config: GameConfig,
) {
  if (!config.validatePick(pick)) {
    throw new HttpError(400, "Invalid pick");
  }

  const multiplier = config.getMultiplier(pick);
  if (!multiplier || multiplier <= 0) {
    throw new HttpError(400, "Invalid multiplier for pick");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(400, "Invalid amount");
  }

  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const round = await tx.round.findFirst({
      where: {
        gameType: config.gameType,
        status: RoundStatus.OPEN,
        locksAt: { gt: now },
      },
      orderBy: { opensAt: "desc" },
    });

    if (!round) {
      throw new HttpError(409, "No open round — try again shortly");
    }

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const balance = new Prisma.Decimal(user.gamingBalance.toString());
    const stake = new Prisma.Decimal(amount);
    if (balance.lt(stake)) {
      throw new HttpError(400, "Insufficient gaming balance");
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        gamingBalance: { decrement: stake },
      },
    });

    return tx.bet.create({
      data: {
        userId,
        roundId: round.id,
        pick,
        multiplier: new Prisma.Decimal(multiplier),
        amount: stake,
      },
    });
  });
}

export async function getCurrentRound(gameType: GameType) {
  const round = await prisma.round.findFirst({
    where: {
      gameType,
      status: { in: [RoundStatus.OPEN, RoundStatus.LOCKED] },
    },
    orderBy: { opensAt: "desc" },
    include: {
      bets: { select: { amount: true, pick: true } },
    },
  });

  if (!round) return null;

  const { serverSeed: _secret, ...rest } = round;
  return rest;
}

export async function getHistory(gameType: GameType, take = 20) {
  return prisma.round.findMany({
    where: { gameType, status: RoundStatus.SETTLED },
    orderBy: { settlesAt: "desc" },
    take,
    select: { id: true, outcome: true, settlesAt: true },
  });
}

export async function getMyBets(userId: string, gameType: GameType, take = 20) {
  return prisma.bet.findMany({
    where: { userId, round: { gameType } },
    orderBy: { createdAt: "desc" },
    take,
    include: { round: { select: { outcome: true, status: true } } },
  });
}
