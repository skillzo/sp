import express from "express";
import diceRouter from "./games/dice/dice.router.js";
import { startGameScheduler } from "./games/engine/scheduler.js";
import {
  globalErrorHandler,
  prisma,
  verifyDatabaseConnection,
} from "./startup/prisma.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

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

app.use("/games/dice", diceRouter);

app.use(globalErrorHandler);

void verifyDatabaseConnection()
  .then(() => {
    startGameScheduler();

    const server = app.listen(port, () => {
      console.log(`http://localhost:${port}`);
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
