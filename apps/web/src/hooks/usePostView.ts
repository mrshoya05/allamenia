"use client";
import { useEffect, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Session-level cache: don't re-track views within same browser session
const viewedPosts = new Set<string>();

interface UsePostViewOptions {
  postId: string;
  enabled?: boolean;
  dwellTime?: number;  // ms post must be visible (default 2s)
  threshold?: number;  // % of post visible (default 50%)
  onViewed?: () => void; // callback when view is counted
}

export function usePostView({
  postId,
  enabled = true,
  dwellTime = 2000,
  threshold = 0.5,
  onViewed,
}: UsePostViewOptions) {
  const elementRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !postId) return;

    // Already viewed in this session - skip API but still show count
    if (viewedPosts.has(postId)) {
      trackedRef.current = true;
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const trackView = async () => {
      if (trackedRef.current) return;
      trackedRef.current = true;
      viewedPosts.add(postId);

      // Optimistic UI update
      onViewed?.();

      try {
        const token = localStorage.getItem("allamenia_access_token");
        await fetch(`${API}/posts/${postId}/view`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch {
        // Silently fail - views are non-critical
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          timerRef.current = setTimeout(trackView, dwellTime);
        } else {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [postId, enabled, dwellTime, threshold]);

  return elementRef;
}
