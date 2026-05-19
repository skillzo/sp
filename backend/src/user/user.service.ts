import type { User } from "@prisma/client";
import { prisma } from "../startup/prisma.js";

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  return prisma.user.findUnique({ where: { email: normalized } });
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
}): Promise<User> {
  const email = input.email.trim().toLowerCase();
  return prisma.user.create({
    data: {
      email,
      passwordHash: input.passwordHash,
    },
  });
}

export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    mainBalance: user.mainBalance.toString(),
    gamingBalance: user.gamingBalance.toString(),
    createdAt: user.createdAt.toISOString(),
  };
}
