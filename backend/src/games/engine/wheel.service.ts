import { GameType, Prisma, RoundStatus } from "@prisma/client";
import { HttpError } from "../../errors/httpError.js";
import { prisma } from "../../startup/prisma.js";
import { generateServerSeed, hashServerSeed } from "../../utils/games.utils.js";
import {
  deriveWheelSegmentIndex,
  formatWheelOutcome,
  getWheelMultiplier,
  isWheelWin,
  normalizeWheelPick,
  parseWheelSegments,
  validateWheelPick,
  wheelPublicConfig,
} from "../wheel/wheel.config.js";

export function getWheelConfig() {
  return wheelPublicConfig;
}

export async function placeWheelSpin(
  userId: string,
  pick: string,
  amount: number,
  segmentsRaw?: unknown,
) {
  let totalSegments;
  try {
    totalSegments = parseWheelSegments(segmentsRaw);
  } catch {
    throw new HttpError(400, "segments must be 20 or 50");
  }

  const canonicalPick = normalizeWheelPick(pick.trim());
  if (!validateWheelPick(canonicalPick)) {
    throw new HttpError(400, "Invalid pick — use 1.2, 1.5, or 3.0");
  }

  const multiplier = getWheelMultiplier(canonicalPick);
  if (!multiplier || multiplier <= 0) {
    throw new HttpError(400, "Invalid multiplier for pick");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(400, "Invalid amount");
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const stake = new Prisma.Decimal(amount);
    const balance = new Prisma.Decimal(user.gamingBalance.toString());
    if (balance.lt(stake)) {
      throw new HttpError(400, "Insufficient gaming balance");
    }

    const now = new Date();
    const serverSeed = generateServerSeed();
    const serverSeedHash = hashServerSeed(serverSeed);

    const round = await tx.round.create({
      data: {
        gameType: GameType.WHEEL,
        status: RoundStatus.SETTLED,
        serverSeed,
        serverSeedHash,
        opensAt: now,
        locksAt: now,
        settlesAt: now,
      },
    });

    const segmentIndex = deriveWheelSegmentIndex(
      serverSeed,
      round.id,
      totalSegments,
    );
    const outcome = formatWheelOutcome(segmentIndex, totalSegments);
    const won = isWheelWin(canonicalPick, segmentIndex, totalSegments);
    const payoutDec = won
      ? stake.mul(new Prisma.Decimal(multiplier))
      : new Prisma.Decimal(0);

    await tx.user.update({
      where: { id: userId },
      data: { gamingBalance: { decrement: stake } },
    });

    if (won && payoutDec.gt(0)) {
      await tx.user.update({
        where: { id: userId },
        data: { gamingBalance: { increment: payoutDec } },
      });
    }

    await tx.round.update({
      where: { id: round.id },
      data: { outcome },
    });

    const bet = await tx.bet.create({
      data: {
        userId,
        roundId: round.id,
        pick: canonicalPick,
        multiplier: new Prisma.Decimal(multiplier),
        amount: stake,
        won,
        payout: payoutDec,
      },
    });

    await tx.houseLedger.create({
      data: {
        roundId: round.id,
        gameType: GameType.WHEEL,
        totalBets: stake,
        totalPayout: payoutDec,
        houseProfit: stake.sub(payoutDec),
      },
    });

    return {
      betId: bet.id,
      roundId: round.id,
      pick: canonicalPick,
      segments: totalSegments,
      segmentIndex,
      multiplier,
      amount: stake.toString(),
      won,
      payout: payoutDec.toString(),
      profit: won
        ? payoutDec.sub(stake).toString()
        : stake.neg().toString(),
      serverSeed,
      serverSeedHash,
      outcome,
      settlesAt: now.toISOString(),
    };
  });
}

export async function getWheelHistory(take = 20) {
  return prisma.round.findMany({
    where: { gameType: GameType.WHEEL, status: RoundStatus.SETTLED },
    orderBy: { settlesAt: "desc" },
    take,
    select: {
      id: true,
      outcome: true,
      settlesAt: true,
      serverSeed: true,
      serverSeedHash: true,
    },
  });
}

export async function getWheelMyBets(userId: string, take = 20) {
  return prisma.bet.findMany({
    where: { userId, round: { gameType: GameType.WHEEL } },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      round: {
        select: {
          outcome: true,
          status: true,
          serverSeed: true,
          serverSeedHash: true,
          settlesAt: true,
        },
      },
    },
  });
}
