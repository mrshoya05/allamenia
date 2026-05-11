"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal, Share2, Trash2, BadgeCheck, Eye } from "lucide-react";
import { PostActions } from "./PostActions";
import { PostMedia } from "./PostMedia";
import { LinkPreview } from "./LinkPreview";
import { CommentsModal } from "./CommentsModal";

interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
  content: string;
  media: Array<{
    type: string;
    url: string;
    thumbnail_url?: string;
    width?: number;
    height?: number;
  }>;
  link_preview?: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    domain?: string;
  };
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  views_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  is_reposted: boolean;
  created_at: string;
  is_edited: boolean;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onUnlike?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

function Avatar({ user, size = 40 }: { user: Post["author"]; size?: number }) {
  const initials = (user.full_name || user.username)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.username}
        className="rounded-full object-cover ring-2 ring-emerald-500/40"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/40"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

function formatTime(dateString: string, mounted: boolean = true): string {
  const date = new Date(dateString);
  
  // Return static format during SSR to avoid hydration mismatch
  if (!mounted) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PostCard({ post, onLike, onUnlike, onRepost, onBookmark, onDelete }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [showComments, setShowComments] = useState(false);

  return (
    <>
      <article className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors">
        {/* Content Container - centered */}
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar user={post.author} size={48} />
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/profile/${post.author.username}`}
                  className="font-bold text-slate-100 hover:underline text-[15px]"
                >
                  {post.author.full_name || post.author.username}
                </Link>

                {post.author.is_verified && (
                  <BadgeCheck className="w-[18px] h-[18px] text-blue-500 fill-blue-500" />
                )}

                <span className="text-slate-500 text-[15px]">@{post.author.username}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-500 text-[15px] hover:underline cursor-pointer">
                  {formatTime(post.created_at, mounted)}
                </span>
              </div>
            </div>

            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-20">
                    <button className="w-full px-4 py-3 text-left text-[15px] text-slate-300 hover:bg-slate-900 transition-colors flex items-center gap-3">
                      <Share2 className="w-[18px] h-[18px]" />
                      Share post
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(post.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-[15px] text-red-500 hover:bg-slate-900 transition-colors flex items-center gap-3"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                        Delete post
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          {post.content && (
            <div className="mb-3 ml-[60px]">
              <p className="text-slate-100 text-[15px] leading-normal whitespace-pre-wrap break-words">
                {post.content}
              </p>
            </div>
          )}

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div className="mb-3 ml-[60px] rounded-2xl overflow-hidden border border-slate-800">
              <PostMedia media={post.media} />
            </div>
          )}

          {/* Link Preview */}
          {post.link_preview && (
            <div className="mb-3 ml-[60px]">
              <LinkPreview preview={post.link_preview} />
            </div>
          )}

          {/* Actions */}
          <div className="ml-[60px]">
            <PostActions
              post={post}
              onLike={onLike}
              onUnlike={onUnlike}
              onRepost={onRepost}
              onBookmark={onBookmark}
              onComment={() => setShowComments(true)}
            />
          </div>
        </div>
      </article>

      {/* Comments Modal */}
      <CommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        post={post}
      />
    </>
  );
}
