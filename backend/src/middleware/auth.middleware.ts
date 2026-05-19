import type { RequestHandler } from "express";
import { HttpError } from "../errors/httpError.js";

/** Dev-friendly: send header `x-user-id: <uuid>`. Replace with JWT verify later. */
export const authMiddleware: RequestHandler = (req, _res, next) => {
  const userId = req.header("x-user-id")?.trim();
  if (!userId) {
    next(new HttpError(401, "Unauthorized"));
    return;
  }
  req.user = { id: userId };
  next();
};
