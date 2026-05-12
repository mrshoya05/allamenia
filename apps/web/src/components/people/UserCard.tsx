"use client";
import { useState } from "react";
import { Loader2, MoreHorizontal, UserMinus, ShieldOff, Clock, UserX } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
  bio?: string;
  followers_count?: number;
  is_private?: boolean;
}

type FollowStatus = "none" | "pending" | "following";

interface UserCardProps {
  user: User;
  followStatus?: FollowStatus;
  onFollow: () => Promise<{ status?: string } | void>;
  onUnfollow: () => Promise<void> | void;
  onBlock: () => Promise<void> | void;
  onRemoveFollower?: () => Promise<void> | void;
}

export function UserCard({ user, followStatus = "none", onFollow, onUnfollow, onBlock, onRemoveFollower }: UserCardProps) {
  const [status, setStatus] = useState<FollowStatus>(followStatus);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleFollowToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (status === "none") {
        const result = await onFollow();
        // Backend returns status: "pending" for private accounts
        const newStatus = (result as any)?.status === "pending" ? "pending" : "following";
        setStatus(newStatus);
      } else {
        await onUnfollow();
        setStatus("none");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    setShowMenu(false);
    await onBlock();
  };

  const formatCount = (n?: number) => {
    if (!n) return null;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  const buttonLabel = () => {
    if (loading) return null;
    if (status === "following") return "Following";
    if (status === "pending") return "Requested";
    return "Follow";
  };

  const buttonClass = () => {
    if (status === "following")
      return "border border-[#536471] text-[#e7e9ea] hover:border-red-500 hover:text-red-500 hover:bg-red-500/10";
    if (status === "pending")
      return "border border-[#536471] text-[#71767b] hover:border-red-500 hover:text-red-500 hover:bg-red-500/10";
    return "bg-[#eff3f4] hover:bg-[#d7dbdc] text-[#0f1419]";
  };

  return (
    <div className="flex items-center gap-3 px-4 py-4 hover:bg-[#080808] transition-colors border-b border-[#2f3336]/50 group">
      {/* Avatar */}
      <Link href={`/profile/${user.username}`} className="flex-shrink-0">
        <Avatar user={user} size={48} />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user.username}`} className="block">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#e7e9ea] text-[15px] hover:underline truncate">
              {user.full_name || user.username}
            </span>
            {user.is_verified && (
              <svg className="w-4 h-4 text-[#1d9bf0] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
              </svg>
            )}
            {user.is_private && (
              <svg className="w-3.5 h-3.5 text-[#71767b] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            )}
          </div>
          <p className="text-[#71767b] text-[14px]">@{user.username}</p>
        </Link>

        {user.bio && (
          <p className="text-[#e7e9ea] text-[14px] mt-1 line-clamp-2">{user.bio}</p>
        )}

        {user.followers_count !== undefined && user.followers_count > 0 && (
          <p className="text-[#71767b] text-[13px] mt-0.5">
            {formatCount(user.followers_count)} followers
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleFollowToggle}
          disabled={loading}
          className={`px-4 py-1.5 rounded-full text-[14px] font-bold transition-all flex items-center gap-1.5 ${buttonClass()} disabled:opacity-50`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : status === "pending" ? (
            <>
              <Clock className="w-3.5 h-3.5" />
              Requested
            </>
          ) : buttonLabel()}
        </button>

        {/* More menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-[#1d1f23] text-[#71767b] hover:text-[#e7e9ea] transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 bg-[#000] border border-[#2f3336] rounded-xl shadow-xl z-20 overflow-hidden">
                {(status === "following" || status === "pending") && (
                  <button
                    onClick={async () => {
                      setShowMenu(false);
                      setLoading(true);
                      await onUnfollow();
                      setStatus("none");
                      setLoading(false);
                    }}
                    className="w-full px-4 py-3 text-left text-[15px] text-[#e7e9ea] hover:bg-[#1d1f23] flex items-center gap-3"
                  >
                    <UserMinus className="w-4 h-4" />
                    {status === "pending" ? "Cancel request" : `Unfollow @${user.username}`}
                  </button>
                )}
                {onRemoveFollower && (
                  <button
                    onClick={async () => {
                      setShowMenu(false);
                      await onRemoveFollower();
                    }}
                    className="w-full px-4 py-3 text-left text-[15px] text-[#e7e9ea] hover:bg-[#1d1f23] flex items-center gap-3"
                  >
                    <UserX className="w-4 h-4" />
                    Remove follower
                  </button>
                )}
                <button
                  onClick={handleBlock}
                  className="w-full px-4 py-3 text-left text-[15px] text-red-500 hover:bg-[#1d1f23] flex items-center gap-3"
                >
                  <ShieldOff className="w-4 h-4" />
                  Block @{user.username}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
