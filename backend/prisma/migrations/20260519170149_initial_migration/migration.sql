-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('COLOR_PREDICTION', 'DICE', 'WHEEL');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('OPEN', 'LOCKED', 'SETTLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "mainBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "gamingBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rounds" (
    "id" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'OPEN',
    "outcome" TEXT,
    "serverSeedHash" TEXT NOT NULL,
    "serverSeed" TEXT,
    "opensAt" TIMESTAMP(3) NOT NULL,
    "locksAt" TIMESTAMP(3) NOT NULL,
    "settlesAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "pick" TEXT NOT NULL,
    "multiplier" DECIMAL(8,2) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "payout" DECIMAL(18,2),
    "won" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "house_ledger" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "totalBets" DECIMAL(18,2) NOT NULL,
    "totalPayout" DECIMAL(18,2) NOT NULL,
    "houseProfit" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "house_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bets_userId_roundId_key" ON "bets"("userId", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "house_ledger_roundId_key" ON "house_ledger"("roundId");

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_ledger" ADD CONSTRAINT "house_ledger_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
