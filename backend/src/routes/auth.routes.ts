import { Router } from "express";
import { getMe, login, register } from "@/auth/auth.service.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { HttpError } from "@/errors/httpError.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };
    if (email === undefined || password === undefined) {
      throw new HttpError(400, "email and password required");
    }
    const result = await register(email, password);
    res.status(201).json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };
    if (email === undefined || password === undefined) {
      throw new HttpError(400, "email and password required");
    }
    const result = await login(email, password);
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
});

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const profile = await getMe(req.user!.id);
    res.json({ success: true, user: profile });
  } catch (e) {
    next(e);
  }
});

export default router;
