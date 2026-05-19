-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('COLOR_PREDICTION', 'DICE', 'WHEEL');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('OPEN', 'LOCKED', 'SETTLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mainBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "gamingBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
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

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "pick" TEXT NOT NULL,
    "multiplier" DECIMAL(8,2) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "payout" DECIMAL(18,2),
    "won" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseLedger" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "totalBets" DECIMAL(18,2) NOT NULL,
    "totalPayout" DECIMAL(18,2) NOT NULL,
    "houseProfit" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bet_userId_roundId_key" ON "Bet"("userId", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseLedger_roundId_key" ON "HouseLedger"("roundId");

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseLedger" ADD CONSTRAINT "HouseLedger_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
