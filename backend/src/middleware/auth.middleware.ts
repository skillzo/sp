import type { RequestHandler } from "express";
import { verifyAccessToken } from "../auth/auth.service.js";
import { HttpError } from "../errors/httpError.js";

export const authMiddleware: RequestHandler = (req, _res, next) => {
  const header = req.header("authorization")?.trim();
  const match = header?.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1];
  if (!token) {
    next(new HttpError(401, "Unauthorized"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (e) {
    next(e);
  }
};
