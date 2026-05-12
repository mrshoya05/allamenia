"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/fetch";

/**
 * Call this in any protected page/layout.
 * - Checks token presence immediately
 * - Validates token with the server on mount and on window focus
 * - Redirects to /login on 401 or missing token
 */
export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("allamenia_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const validate = async () => {
      // apiFetch already handles 401 → redirect internally,
      // but we also handle it here for an explicit router.replace
      const res = await apiFetch("/users/me", { skipAuthRedirect: true });
      if (res.status === 401) {
        localStorage.removeItem("allamenia_access_token");
        localStorage.removeItem("allamenia_refresh_token");
        router.replace("/login");
      }
    };

    validate();

    // Re-validate when the tab regains focus (catches expiry while tab was hidden)
    window.addEventListener("focus", validate);
    return () => window.removeEventListener("focus", validate);
  }, [router]);
}
