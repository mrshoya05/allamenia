/**
 * Central fetch wrapper.
 * - Attaches Authorization header automatically
 * - On 401 → clears tokens and redirects to /login
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function clearSession() {
  localStorage.removeItem("allamenia_access_token");
  localStorage.removeItem("allamenia_refresh_token");
}

function redirectToLogin() {
  clearSession();
  // Use replace so the user can't go "back" to the protected page
  window.location.replace("/login");
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("allamenia_access_token");
}

export interface ApiFetchOptions extends RequestInit {
  /** Skip the 401 redirect (e.g. on the login page itself) */
  skipAuthRedirect?: boolean;
}

/**
 * Drop-in replacement for `fetch` that handles auth automatically.
 * Throws on non-ok responses (except when you handle them yourself).
 */
export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const { skipAuthRedirect = false, ...fetchOptions } = options;

  const token = getToken();

  // Merge Authorization into existing headers
  const headers = new Headers(fetchOptions.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (res.status === 401 && !skipAuthRedirect) {
    redirectToLogin();
    // Return the response anyway so callers don't crash before redirect
    return res;
  }

  return res;
}

/** Convenience: apiFetch + parse JSON */
export async function apiFetchJson<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const res = await apiFetch(path, options);
  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try {
      const err = await res.json();
      detail = Array.isArray(err.detail)
        ? err.detail.map((e: { msg: string }) => e.msg).join(", ")
        : err.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}
