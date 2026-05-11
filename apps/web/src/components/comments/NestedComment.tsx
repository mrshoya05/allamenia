"use client";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, MoreHorizontal, Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import Link from "next/link";

interface Comment {
  id: string;
  author: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    is_verified: boolean;
  };
  content: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
  replies?: Comment[];
}

interface NestedCommentProps {
  comment: Comment;
  depth?: number;
  maxDepth?: number;
  onLike: (commentId: string) => void;
  onReply: (commentId: string, username: string) => void;
  onDelete?: (commentId: string) => void;
  onLoadReplies?: (commentId: string) => void;
}

export function NestedComment({
  comment,
  depth = 0,
  maxDepth = 10,
  onLike,
  onReply,
  onDelete,
  onLoadReplies,
}: NestedCommentProps) {
  const [showReplies, setShowReplies] = useState(depth < 2); // Auto-expand first 2 levels
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.is_liked);
  const [likesCount, setLikesCount] = useState(comment.likes_count);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    onLike(comment.id);
  };

  const formatTime = (dateString: string) => {
    if (!mounted) {
      // Return a static format during SSR to avoid hydration mismatch
      return new Date(dateString).toLocaleDateString();
    }
    
    const date = new Date(dateString);
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
    return date.toLocaleDateString();
  };

  const hasReplies = comment.replies && comment.replies.length > 0;
  const canNest = depth < maxDepth;

  return (
    <div className="group relative">
      {/* Comment */}
      <div className="flex gap-3 py-3">
        {/* Avatar */}
        <Link href={`/profile/${comment.author.username}`} className="flex-shrink-0">
          <Avatar user={comment.author} size={depth === 0 ? 40 : 32} />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/profile/${comment.author.username}`}
              className="font-bold text-[#e7e9ea] hover:underline text-[15px]"
            >
              {comment.author.full_name || comment.author.username}
            </Link>
            <Link
              href={`/profile/${comment.author.username}`}
              className="text-[#71767b] text-[15px]"
            >
              @{comment.author.username}
            </Link>
            <span className="text-[#71767b]">·</span>
            <span className="text-[#71767b] text-[15px]">{formatTime(comment.created_at)}</span>

            {/* Menu */}
            <div className="ml-auto relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-full hover:bg-[#1d9bf0]/10 text-[#71767b] hover:text-[#1d9bf0] opacity-0 group-hover:opacity-100 transition-all"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#000] border border-[#2f3336] rounded-lg shadow-xl z-20 overflow-hidden">
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(comment.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-[15px] text-[#f4212e] hover:bg-[#0a0a0a] transition-colors flex items-center gap-3"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Text */}
          <p className="text-[#e7e9ea] text-[15px] leading-normal mb-2 break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1 -ml-2">
            {/* Reply */}
            <button
              onClick={() => onReply(comment.id, comment.author.username)}
              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-[#1d9bf0]/10 text-[#71767b] hover:text-[#1d9bf0] transition-all group/reply"
            >
              <MessageCircle className="w-[18px] h-[18px]" />
              {comment.comments_count > 0 && (
                <span className="text-[13px]">{comment.comments_count}</span>
              )}
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all group/like ${
                isLiked
                  ? "text-[#f91880]"
                  : "hover:bg-[#f91880]/10 text-[#71767b] hover:text-[#f91880]"
              }`}
            >
              <Heart
                className={`w-[18px] h-[18px] ${isLiked ? "fill-[#f91880]" : ""}`}
              />
              {likesCount > 0 && (
                <span className="text-[13px]">{likesCount}</span>
              )}
            </button>

            {/* Toggle Replies */}
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-[#1d9bf0]/10 text-[#71767b] hover:text-[#1d9bf0] transition-all text-[13px] font-medium"
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide replies
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show {comment.replies!.length} {comment.replies!.length === 1 ? "reply" : "replies"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies with visual hierarchy */}
      {hasReplies && showReplies && canNest && (
        <div className={`relative ${depth === 0 ? 'ml-12' : 'ml-8'}`}>
          {/* Vertical line connecting replies */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#2f3336]" />
          
          <div className="pl-4">
            {comment.replies!.map((reply, index) => (
              <div key={reply.id} className="relative">
                {/* Horizontal connector line */}
                <div 
                  className="absolute left-0 top-6 w-4 h-[2px] bg-[#2f3336]"
                  style={{ top: depth === 0 ? '24px' : '20px' }}
                />
                
                <NestedComment
                  comment={reply}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  onLike={onLike}
                  onReply={onReply}
                  onDelete={onDelete}
                  onLoadReplies={onLoadReplies}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Max depth reached */}
      {hasReplies && depth >= maxDepth && (
        <div className="ml-12 mt-2">
          <Link
            href={`/post/${comment.id}`}
            className="text-[#1d9bf0] text-[13px] hover:underline inline-flex items-center gap-1"
          >
            Continue this thread →
          </Link>
        </div>
      )}
    </div>
  );
}
