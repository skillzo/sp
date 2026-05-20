import { apiFetch } from "../http";

export type AuthUser = {
  id: string;
  email: string;
  mainBalance: string;
  gamingBalance: string;
  createdAt?: string;
};

export type AuthResponse = {
  success: boolean;
  token: string;
  user: AuthUser;
};

export type MeResponse = {
  success: boolean;
  user: AuthUser;
};

export function authLogin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch("/auth/login", {
    method: "POST",
    json: { email, password },
  });
}

export function authRegister(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch("/auth/register", {
    method: "POST",
    json: { email, password },
  });
}

export function authMe(token: string): Promise<MeResponse> {
  return apiFetch("/auth/me", { method: "GET", token });
}
