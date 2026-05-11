"use client";
import { useState } from "react";
import { Heart, MessageCircle, Repeat2, Share2, Bookmark } from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  is_reposted: boolean;
}

interface PostActionsProps {
  post: Post;
  onLike?: (postId: string) => void;
  onUnlike?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export function PostActions({ post, onLike, onUnlike, onRepost, onBookmark, onComment }: PostActionsProps) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked);
  const [reposted, setReposted] = useState(post.is_reposted);
  const [repostsCount, setRepostsCount] = useState(post.reposts_count);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      if (newLiked) {
        await onLike?.(post.id);
      } else {
        await onUnlike?.(post.id);
      }
    } catch (error) {
      setLiked(!newLiked);
      setLikesCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  const handleRepost = async () => {
    const newReposted = !reposted;
    setReposted(newReposted);
    setRepostsCount((prev) => (newReposted ? prev + 1 : prev - 1));

    try {
      await onRepost?.(post.id);
    } catch (error) {
      setReposted(!newReposted);
      setRepostsCount((prev) => (newReposted ? prev - 1 : prev + 1));
    }
  };

  const handleBookmark = async () => {
    setBookmarked(!bookmarked);
    try {
      await onBookmark?.(post.id);
    } catch (error) {
      setBookmarked(bookmarked);
    }
  };

  return (
    <div className="flex items-center justify-between max-w-md">
      {/* Comment Button */}
      <button
        onClick={() => onComment?.(post.id)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 transition-all group -ml-2"
      >
        <MessageCircle className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
        {post.comments_count > 0 && (
          <span className="text-[13px] font-medium">
            {post.comments_count.toLocaleString()}
          </span>
        )}
      </button>

      {/* Repost Button */}
      <button
        onClick={handleRepost}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-full transition-all group ${
          reposted
            ? "text-green-500"
            : "text-slate-500 hover:text-green-500 hover:bg-green-500/10"
        }`}
      >
        <Repeat2 className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
        {repostsCount > 0 && (
          <span className="text-[13px] font-medium">
            {repostsCount.toLocaleString()}
          </span>
        )}
      </button>

      {/* Like Button */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-full transition-all group ${
          liked
            ? "text-pink-600"
            : "text-slate-500 hover:text-pink-600 hover:bg-pink-600/10"
        }`}
      >
        <Heart
          className={`w-[18px] h-[18px] group-hover:scale-110 transition-transform ${
            liked ? "fill-pink-600" : ""
          }`}
        />
        {likesCount > 0 && (
          <span className="text-[13px] font-medium">
            {likesCount.toLocaleString()}
          </span>
        )}
      </button>

      {/* Share Button */}
      <button className="flex items-center gap-2 px-2 py-1.5 rounded-full text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 transition-all group">
        <Share2 className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
      </button>

      {/* Bookmark Button */}
      <button
        onClick={handleBookmark}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-full transition-all group ${
          bookmarked
            ? "text-blue-500"
            : "text-slate-500 hover:text-blue-500 hover:bg-blue-500/10"
        }`}
      >
        <Bookmark
          className={`w-[18px] h-[18px] group-hover:scale-110 transition-transform ${
            bookmarked ? "fill-blue-500" : ""
          }`}
        />
      </button>
    </div>
  );
}
