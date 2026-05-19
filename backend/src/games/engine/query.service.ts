import { GameType, RoundStatus } from "@prisma/client";
import { prisma } from "../../startup/prisma.js";

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
