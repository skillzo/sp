import { PrismaClient } from "@prisma/client";
import type { ErrorRequestHandler } from "express";
import { Env } from "../config/Env.js";
import { HttpError } from "../errors/httpError.js";
import logger from "./logger.js";

export const prisma = new PrismaClient();

export const verifyDatabaseConnection = async () => {
  if (!Env.DATABASE_URL) {
    logger.warn("DATABASE_URL not set. Skipping database connection check.");
    return;
  }

  try {
    await prisma.$connect();
    logger.info("Database connection established.");
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to database");
    throw error;
  }
};

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  next,
) => {
  if (!err) return next();
  if (err instanceof HttpError) {
    logger.warn({ err }, "HTTP error");
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  logger.error({ err }, "Unhandled error");
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
