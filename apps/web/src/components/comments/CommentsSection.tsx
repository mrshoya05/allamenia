"use client";
import { useState, useEffect } from "react";
import { MessageCircle, TrendingUp, Clock, Loader2 } from "lucide-react";
import { NestedComment } from "./NestedComment";

interface Comment {
  id: string;
  author: any;
  content: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
  replies?: Comment[];
}

interface CommentsSectionProps {
  postId: string;
  initialComments?: Comment[];
  onReply: (commentId: string, username: string) => void;
}

type SortType = "top" | "new" | "old";

export function CommentsSection({ postId, initialComments = [], onReply }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>("top");

  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/posts/${postId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setComments(buildCommentTree(data || []));
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Build nested comment tree
  const buildCommentTree = (flatComments: any[]): Comment[] => {
    const commentMap = new Map();
    const rootComments: Comment[] = [];

    // First pass: create map with all comments
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [], comments_count: comment.replies_count || 0 });
    });

    // Second pass: build tree structure
    flatComments.forEach(comment => {
      const commentNode = commentMap.get(comment.id);
      
      // Check if this is a reply to another comment
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        
        if (parent) {
          // This is a nested reply (reply to a comment)
          parent.replies.push(commentNode);
        } else {
          // Parent not found in current batch, treat as root
          rootComments.push(commentNode);
        }
      } else {
        // No parent_comment_id, this is a direct comment on the post
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  };

  const sortComments = (comments: Comment[]): Comment[] => {
    const sorted = [...comments];
    
    switch (sortBy) {
      case "top":
        sorted.sort((a, b) => b.likes_count - a.likes_count);
        break;
      case "new":
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "old":
        sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
    }

    // Recursively sort replies
    sorted.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = sortComments(comment.replies);
      }
    });

    return sorted;
  };

  const handleLike = async (commentId: string) => {
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const comment = findComment(comments, commentId);
      
      const method = comment?.is_liked ? "DELETE" : "POST";
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/posts/${postId}/comments/${commentId}/like`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        // Refresh comments
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const findComment = (comments: Comment[], id: string): Comment | null => {
    for (const comment of comments) {
      if (comment.id === id) return comment;
      if (comment.replies) {
        const found = findComment(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  const sortedComments = sortComments(comments);

  return (
    <div className="border-t border-[#2f3336]">
      {/* Sort Options */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2f3336]">
        <button
          onClick={() => setSortBy("top")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[15px] font-medium transition-all ${
            sortBy === "top"
              ? "bg-[#1d9bf0] text-white"
              : "text-[#71767b] hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0]"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Top
        </button>
        <button
          onClick={() => setSortBy("new")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[15px] font-medium transition-all ${
            sortBy === "new"
              ? "bg-[#1d9bf0] text-white"
              : "text-[#71767b] hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0]"
          }`}
        >
          <Clock className="w-4 h-4" />
          New
        </button>
        <button
          onClick={() => setSortBy("old")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[15px] font-medium transition-all ${
            sortBy === "old"
              ? "bg-[#1d9bf0] text-white"
              : "text-[#71767b] hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0]"
          }`}
        >
          <Clock className="w-4 h-4" />
          Old
        </button>
      </div>

      {/* Comments List */}
      <div className="px-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-[#1d9bf0] animate-spin" />
          </div>
        ) : sortedComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-[#71767b] mx-auto mb-3 opacity-50" />
            <p className="text-[#71767b] text-[15px]">No comments yet</p>
            <p className="text-[#71767b] text-[13px] mt-1">Be the first to comment!</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <NestedComment
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              onReply={onReply}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
