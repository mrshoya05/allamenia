"use client";
import { useState, useEffect } from "react";
import { Loader2, UserCheck, UserX } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import Link from "next/link";

interface SuggestedUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  is_verified: boolean;
  bio: string;
  followers_count: number;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function WhoToFollowWidget() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followState, setFollowState] = useState<Record<string, "loading" | "following" | "pending">>({});

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const res = await fetch(`${API}/users/suggestions?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    setFollowState(s => ({ ...s, [userId]: "loading" }));
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const res = await fetch(`${API}/follows/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // If private account, status will be "pending"
      const newState = data.status === "pending" ? "pending" : "following";
      setFollowState(s => ({ ...s, [userId]: newState }));
    } catch (e) {
      console.error(e);
      setFollowState(s => { const n = { ...s }; delete n[userId]; return n; });
    }
  };

  const handleUnfollow = async (userId: string) => {
    setFollowState(s => ({ ...s, [userId]: "loading" }));
    try {
      const token = localStorage.getItem("allamenia_access_token");
      await fetch(`${API}/follows/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowState(s => { const n = { ...s }; delete n[userId]; return n; });
    } catch (e) {
      console.error(e);
      setFollowState(s => ({ ...s, [userId]: "following" }));
    }
  };

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div className="bg-[#16181c] rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2f3336]">
        <h2 className="text-[20px] font-bold text-[#e7e9ea]">Who to follow</h2>
      </div>

      <div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-[#1d9bf0] animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-[#71767b] text-sm px-4 py-6 text-center">No suggestions right now</p>
        ) : (
          users.map((user) => {
            const state = followState[user.id];
            const isFollowing = state === "following";
            const isPending = state === "pending";
            const isLoading = state === "loading";

            return (
              <div key={user.id} className="px-4 py-3 hover:bg-[#1d1f23] transition-colors">
                <div className="flex items-center gap-3">
                  <Link href={`/profile/${user.username}`} className="flex-shrink-0">
                    <Avatar user={user} size={44} />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${user.username}`} className="block">
                      <p className="font-bold text-[#e7e9ea] text-[14px] truncate hover:underline">
                        {user.full_name || user.username}
                      </p>
                      <p className="text-[#71767b] text-[13px] truncate">@{user.username}</p>
                    </Link>
                    {user.followers_count > 0 && (
                      <p className="text-[#71767b] text-[12px] mt-0.5">
                        {formatCount(user.followers_count)} followers
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (isLoading) return;
                      if (isFollowing || isPending) handleUnfollow(user.id);
                      else handleFollow(user.id);
                    }}
                    disabled={isLoading}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all flex items-center gap-1.5 ${
                      isFollowing
                        ? "border border-[#536471] text-[#e7e9ea] hover:border-red-500 hover:text-red-500"
                        : isPending
                        ? "border border-[#536471] text-[#71767b] hover:border-red-500 hover:text-red-500"
                        : "bg-[#eff3f4] hover:bg-[#d7dbdc] text-[#0f1419]"
                    } disabled:opacity-50`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isFollowing ? (
                      "Following"
                    ) : isPending ? (
                      "Requested"
                    ) : (
                      "Follow"
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Link
        href="/people"
        className="block px-4 py-3 text-[#1d9bf0] text-[14px] hover:bg-[#1d1f23] transition-colors"
      >
        Show more
      </Link>
    </div>
  );
}
