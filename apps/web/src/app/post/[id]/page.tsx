"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { AppNavbar } from "@/components/ui/AppNavbar";
import { PostCard } from "@/components/posts/PostCard";
import { PostComposer } from "@/components/posts/PostComposer";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { usePostActions } from "@/hooks/usePosts";

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const actions = usePostActions();

  useEffect(() => {
    const token = localStorage.getItem("allamenia_access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReply = async (data: { content: string; media: any[] }) => {
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: data.content,
            parent_comment_id: replyingTo?.id || null,
          }),
        }
      );
      if (response.ok) {
        // Refresh the post to update comment count
        fetchPost();
        // Clear replying state
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Failed to create reply:", error);
    }
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyingTo({ id: commentId, username });
    // Scroll to composer
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLike = async (postId: string) => {
    await actions.likePost(postId);
    fetchPost(); // Refresh to update counts
  };

  const handleUnlike = async (postId: string) => {
    await actions.unlikePost(postId);
    fetchPost(); // Refresh to update counts
  };

  const handleBookmark = async (postId: string) => {
    const targetPost = post?.id === postId ? post : null;
    if (targetPost?.is_bookmarked) {
      await actions.unbookmarkPost(postId);
    } else {
      await actions.bookmarkPost(postId);
    }
    fetchPost(); // Refresh to update state
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AppNavbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AppNavbar />
        <div className="max-w-2xl mx-auto px-4 pt-24 text-center">
          <h2 className="text-2xl font-bold text-slate-300 mb-2">Post not found</h2>
          <p className="text-slate-500 mb-6">This post may have been deleted.</p>
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AppNavbar />

      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-slate-800/50 sticky top-16 bg-slate-950/80 backdrop-blur-xl z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-slate-800/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <h1 className="text-xl font-bold text-slate-100">Post</h1>
          </div>
        </div>

        {/* Main Post */}
        <PostCard
          post={post}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onBookmark={handleBookmark}
        />

        {/* Reply Composer */}
        <div className="border-b border-slate-800/50">
          <div className="max-w-2xl mx-auto px-4 py-4">
            {replyingTo && (
              <div className="mb-2 text-sm text-slate-400">
                Replying to @{replyingTo.username}
                <button
                  onClick={() => setReplyingTo(null)}
                  className="ml-2 text-blue-500 hover:text-blue-400"
                >
                  Cancel
                </button>
              </div>
            )}
            <PostComposer
              onSubmit={handleCreateReply}
              placeholder={
                replyingTo
                  ? `Reply to @${replyingTo.username}...`
                  : `Reply to @${post.author.username}...`
              }
            />
          </div>
        </div>

        {/* Comments Section */}
        <CommentsSection
          postId={postId}
          onReply={handleReply}
        />
      </div>
    </div>
  );
}
