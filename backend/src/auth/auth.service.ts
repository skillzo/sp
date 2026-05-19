import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { Env } from "../config/Env.js";
import { HttpError } from "../errors/httpError.js";
import {
  createUser,
  getUserByEmail,
  getUserById,
  toPublicUser,
} from "../user/user.service.js";

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, Env.BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, passwordHash);
}

export function signAccessToken(userId: string, email: string): string {
  if (!Env.JWT_SECRET) {
    throw new HttpError(503, "Authentication is not configured");
  }
  const options: SignOptions = {
    subject: userId,
    expiresIn: Env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign({ email }, Env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  if (!Env.JWT_SECRET) {
    throw new HttpError(503, "Authentication is not configured");
  }
  try {
    const decoded = jwt.verify(token, Env.JWT_SECRET) as jwt.JwtPayload & {
      email?: string;
    };
    if (!decoded.sub || typeof decoded.email !== "string") {
      throw new Error("Invalid token payload");
    }
    return { sub: decoded.sub, email: decoded.email };
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(email: string, password: string) {
  const em = email.trim();
  if (!EMAIL_RE.test(em)) {
    throw new HttpError(400, "Invalid email");
  }
  if (password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters");
  }

  const existing = await getUserByEmail(em);
  if (existing) {
    throw new HttpError(409, "Email already registered");
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ email: em, passwordHash });
  const token = signAccessToken(user.id, user.email);

  return {
    token,
    user: toPublicUser(user),
  };
}

export async function login(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, "Invalid email or password");
  }

  const token = signAccessToken(user.id, user.email);
  return {
    token,
    user: toPublicUser(user),
  };
}

export async function getMe(userId: string) {
  const user = await getUserById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return toPublicUser(user);
}
