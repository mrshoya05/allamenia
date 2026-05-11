"use client";
import { useState, useEffect, useRef } from "react";
import { X, Heart, MessageCircle, Send, Loader2, CornerDownRight } from "lucide-react";
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
  replies_count: number;
  is_liked: boolean;
  created_at: string;
  parent_comment_id: string | null;
  replies?: Comment[];
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
}

// Build nested tree from flat list
function buildTree(flat: Comment[]): Comment[] {
  const map = new Map<string, Comment>();
  const roots: Comment[] = [];

  flat.forEach(c => map.set(c.id, { ...c, replies: [] }));

  flat.forEach(c => {
    const node = map.get(c.id)!;
    if (c.parent_comment_id && map.has(c.parent_comment_id)) {
      map.get(c.parent_comment_id)!.replies!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function CommentsModal({ isOpen, onClose, post }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen && post) fetchComments();
  }, [isOpen, post]);

  useEffect(() => {
    if (replyingTo && textareaRef.current) textareaRef.current.focus();
  }, [replyingTo]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/posts/${post.id}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setComments(buildTree(data || []));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/posts/${post.id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            content: replyText,
            parent_comment_id: replyingTo?.id || null,
          }),
        }
      );
      if (res.ok) {
        await fetchComments();
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string, isLiked: boolean) => {
    try {
      const token = localStorage.getItem("allamenia_access_token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/posts/${post.id}/comments/${commentId}/like`,
        { method: isLiked ? "DELETE" : "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchComments();
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (!mounted) return date.toLocaleDateString();
    const diff = Date.now() - date.getTime();
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (s < 60) return `${s}s`;
    if (m < 60) return `${m}m`;
    if (h < 24) return `${h}h`;
    if (d < 7) return `${d}d`;
    return date.toLocaleDateString();
  };

  // Count total flat comments
  const countAll = (list: Comment[]): number =>
    list.reduce((acc, c) => acc + 1 + countAll(c.replies || []), 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-slate-950 rounded-t-3xl border-t border-slate-800 max-h-[85vh] flex flex-col">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Comments</h2>
              <p className="text-sm text-slate-500">
                {countAll(comments)} {countAll(comments) === 1 ? "comment" : "comments"}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800/50 transition-all">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">No comments yet</p>
                <p className="text-slate-600 text-sm">Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {comments.map((comment, idx) => (
                  <CommentNode
                    key={comment.id}
                    comment={comment}
                    depth={0}
                    isLast={idx === comments.length - 1}
                    onLike={handleLike}
                    onReply={(id, username) => {
                      setReplyingTo({ id, username });
                      setReplyText(`@${username} `);
                    }}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-800/50 p-4 bg-slate-950">
            {replyingTo && (
              <div className="flex items-center gap-2 mb-2 text-sm">
                <CornerDownRight className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-slate-400">Replying to</span>
                <span className="text-blue-400 font-medium">@{replyingTo.username}</span>
                <button
                  onClick={() => { setReplyingTo(null); setReplyText(""); }}
                  className="ml-auto text-slate-600 hover:text-slate-400 text-xs"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex items-end gap-3">
              <div className="flex-1 bg-slate-900/50 rounded-2xl px-4 py-2 border border-slate-800/50 focus-within:border-blue-500/50 transition-colors">
                <textarea
                  ref={textareaRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Add a comment..."}
                  className="w-full bg-transparent border-none outline-none resize-none text-slate-100 placeholder:text-slate-600 text-[15px] max-h-32"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!replyText.trim() || submitting}
                className="flex-shrink-0 p-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-full transition-all"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface CommentNodeProps {
  comment: Comment;
  depth: number;
  isLast: boolean;
  onLike: (id: string, isLiked: boolean) => void;
  onReply: (id: string, username: string) => void;
  formatTime: (d: string) => string;
}

function CommentNode({ comment, depth, isLast, onLike, onReply, formatTime }: CommentNodeProps) {
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const avatarSize = depth === 0 ? 36 : 28;

  return (
    <div className="relative">
      <div className="flex gap-3 py-2">
        {/* Left thread line column */}
        <div className="flex flex-col items-center flex-shrink-0" style={{ width: avatarSize }}>
          <Link href={`/profile/${comment.author.username}`}>
            <Avatar user={comment.author} size={avatarSize} />
          </Link>

          {/* Vertical dotted line going down to replies */}
          {hasReplies && showReplies && (
            <div
              className="mt-1 flex-1 min-h-[8px]"
              style={{
                width: 2,
                background: "repeating-linear-gradient(to bottom, #334155 0px, #334155 4px, transparent 4px, transparent 8px)",
              }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-1">
          <div className="bg-slate-900/60 rounded-2xl px-3 py-2.5 inline-block max-w-full">
            <Link
              href={`/profile/${comment.author.username}`}
              className="font-semibold text-slate-100 text-sm hover:underline"
            >
              {comment.author.full_name || comment.author.username}
            </Link>
            {comment.author.full_name && (
              <span className="text-slate-500 text-xs ml-1">@{comment.author.username}</span>
            )}
            <p className="text-slate-200 text-[14px] mt-0.5 break-words leading-snug">
              {comment.content}
            </p>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-4 mt-1.5 ml-1">
            <span className="text-xs text-slate-600">{formatTime(comment.created_at)}</span>

            <button
              onClick={() => onLike(comment.id, comment.is_liked)}
              className={`text-xs font-medium transition-colors flex items-center gap-1 ${
                comment.is_liked ? "text-pink-500" : "text-slate-500 hover:text-pink-500"
              }`}
            >
              <Heart className={`w-3 h-3 ${comment.is_liked ? "fill-pink-500" : ""}`} />
              {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
              {comment.is_liked ? "Liked" : "Like"}
            </button>

            <button
              onClick={() => onReply(comment.id, comment.author.username)}
              className="text-xs text-slate-500 hover:text-blue-400 font-medium transition-colors"
            >
              Reply
            </button>

            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-blue-500/70 hover:text-blue-400 font-medium transition-colors"
              >
                {showReplies
                  ? "Hide replies"
                  : `${comment.replies!.length} ${comment.replies!.length === 1 ? "reply" : "replies"}`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {hasReplies && showReplies && (
        <div className="ml-5 pl-4 border-l-2 border-dashed border-slate-800">
          {comment.replies!.map((reply, idx) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              isLast={idx === comment.replies!.length - 1}
              onLike={onLike}
              onReply={onReply}
              formatTime={formatTime}
            />
          ))}
        </div>
      )}
    </div>
  );
}
