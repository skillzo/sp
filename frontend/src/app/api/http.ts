const apiBase = (): string => {
  const raw = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
  return raw.replace(/\/$/, "");
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & {
    json?: unknown;
    token?: string | null;
  },
): Promise<T> {
  const { json, token, headers: initHeaders, ...rest } = init ?? {};
  const headers = new Headers(initHeaders);
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${apiBase()}${path}`, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  const ct = res.headers.get("content-type");
  const parsed = ct?.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text();

  if (!res.ok) {
    const msg =
      typeof parsed === "object" && parsed !== null && "message" in parsed
        ? String((parsed as { message: string }).message)
        : res.statusText;
    throw new ApiError(msg || "Request failed", res.status, parsed);
  }

  return parsed as T;
}

export { apiBase };
