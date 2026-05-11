"use client";
import { useState, useEffect, useRef } from "react";
import { Loader2, TrendingUp, Bookmark, RefreshCw, ChevronDown } from "lucide-react";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";

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
  media: any[];
  link_preview?: any;
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

interface FeedProps {
  initialPosts?: Post[];
  loading?: boolean;
  hasMore?: boolean;
  showComposer?: boolean;
  activeTab?: "foryou" | "trending" | "bookmarks";
  onLoadMore?: () => void;
  onCreatePost?: (data: any) => Promise<void>;
  onLike?: (postId: string) => Promise<void>;
  onUnlike?: (postId: string) => Promise<void>;
  onRepost?: (postId: string) => Promise<void>;
  onBookmark?: (postId: string) => Promise<void>;
  onDelete?: (postId: string) => Promise<void>;
}

export function Feed({
  initialPosts = [],
  loading: externalLoading = false,
  hasMore: externalHasMore = true,
  showComposer = true,
  activeTab = "foryou",
  onLoadMore,
  onCreatePost,
  onLike,
  onUnlike,
  onRepost,
  onBookmark,
  onDelete,
}: FeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Update posts when initialPosts change
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // Infinite scroll
  useEffect(() => {
    if (!onLoadMore || !externalHasMore || externalLoading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && onLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [externalLoading, externalHasMore, onLoadMore]);

  const handleCreatePost = async (data: any) => {
    if (onCreatePost) {
      await onCreatePost(data);
    }
  };

  return (
    <div className="w-full">
      {/* Post Composer */}
      {onCreatePost && showComposer && (
        <div className="max-w-2xl mx-auto px-4 mb-2">
          <PostComposer onSubmit={handleCreatePost} />
        </div>
      )}

      {/* Posts List */}
      <div>
        {posts.length === 0 && !externalLoading ? (
          <div className="max-w-2xl mx-auto px-4 py-12">
            <EmptyState tab={activeTab} />
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={onLike}
              onUnlike={onUnlike}
              onRepost={onRepost}
              onBookmark={onBookmark}
              onDelete={onDelete}
            />
          ))
        )}

        {/* Loading Skeleton */}
        {externalLoading && (
          <div>
            {[1, 2, 3].map((i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Load More Button (Fallback) + Infinite Scroll Trigger */}
        {externalHasMore && !externalLoading && (
          <div className="py-6">
            <button
              onClick={onLoadMore}
              className="mx-auto flex items-center gap-2 px-6 py-3 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold rounded-full transition-all transform hover:scale-105 active:scale-95"
            >
              <ChevronDown className="w-5 h-5" />
              Load More Posts
            </button>
            {/* Hidden trigger for infinite scroll */}
            <div ref={loadMoreRef} className="h-4" />
          </div>
        )}

        {/* End of Feed */}
        {!externalHasMore && posts.length > 0 && (
          <div className="py-8 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#16181c] rounded-full border border-[#2f3336]">
              <span className="text-[14px] text-[#71767b]">You've caught up! 🎉</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  const messages = {
    foryou: {
      icon: <RefreshCw className="w-12 h-12 text-slate-700" />,
      title: "No posts yet",
      description: "Follow some users to see their posts here",
    },
    trending: {
      icon: <TrendingUp className="w-12 h-12 text-slate-700" />,
      title: "Nothing trending",
      description: "Check back later for trending posts",
    },
    bookmarks: {
      icon: <Bookmark className="w-12 h-12 text-slate-700" />,
      title: "No bookmarks",
      description: "Bookmark posts to save them for later",
    },
  };

  const message = messages[tab as keyof typeof messages] || messages.foryou;

  return (
    <div className="py-20 text-center">
      <div className="flex justify-center mb-4">{message.icon}</div>
      <h3 className="text-xl font-bold text-slate-300 mb-2">{message.title}</h3>
      <p className="text-slate-600">{message.description}</p>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="border-b border-slate-800/50">
      <div className="max-w-2xl mx-auto px-4 py-4 animate-pulse">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-800" />
          <div className="flex-1">
            <div className="h-4 bg-slate-800 rounded w-32 mb-2" />
            <div className="h-3 bg-slate-800 rounded w-24 mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-800 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
