import "dotenv/config";
import cors from "cors";
import express from "express";
import {
  authRouter,
  colorPredictionRouter,
  diceRouter,
  wheelRouter,
} from "./routes/index.js";
import { startGameScheduler } from "./games/engine/scheduler.js";
import {
  globalErrorHandler,
  prisma,
  verifyDatabaseConnection,
} from "./startup/prisma.js";
import { Env } from "./config/Env.js";
import logger from "./startup/logger.js";

const app = express();
const port = Env.PORT;

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/health/db", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: true });
  } catch (error) {
    next(error);
  }
});

app.use("/auth", authRouter);
app.use("/games/color-prediction", colorPredictionRouter);
app.use("/games/dice", diceRouter);
app.use("/games/wheel", wheelRouter);

app.use(globalErrorHandler);

void verifyDatabaseConnection()
  .then(() => {
    startGameScheduler();

    const server = app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });

    const shutdown = async () => {
      server.close();
      await prisma.$disconnect();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  })
  .catch(() => {
    process.exit(1);
  });
