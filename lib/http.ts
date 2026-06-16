/**
 * Typed fetch wrapper with timeout + structured errors.
 * Safe to use inside `use cache` scopes (no request-time APIs touched).
 */
export class ApiError extends Error {
  status: number;
  cause?: unknown;
  constructor(message: string, status = 0, cause?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.cause = cause;
  }
}

interface FetchJsonOptions {
  timeoutMs?: number;
  init?: RequestInit;
}

export async function fetchJson<T>(
  url: string,
  { timeoutMs = 8000, init }: FetchJsonOptions = {}
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      throw new ApiError(
        `Request failed: ${res.status} ${res.statusText}`,
        res.status
      );
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(`Request timed out after ${timeoutMs}ms`, 408, err);
    }
    throw new ApiError(
      err instanceof Error ? err.message : "Unknown fetch error",
      0,
      err
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Like fetchJson but returns the raw response text (e.g. rendered HTML). */
export async function fetchText(
  url: string,
  { timeoutMs = 8000, init }: FetchJsonOptions = {}
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      throw new ApiError(
        `Request failed: ${res.status} ${res.statusText}`,
        res.status
      );
    }
    return await res.text();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(`Request timed out after ${timeoutMs}ms`, 408, err);
    }
    throw new ApiError(
      err instanceof Error ? err.message : "Unknown fetch error",
      0,
      err
    );
  } finally {
    clearTimeout(timer);
  }
}
