import { apiFetch, apiFetchJson } from "./fetch";

export interface Post {
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

export interface CreatePostData {
  content: string;
  media?: Array<{ type: string; url: string; width?: number; height?: number }>;
  visibility?: "public" | "followers" | "private";
  reply_to_post_id?: string;
}

export interface PaginatedPostsResponse {
  posts: Post[];
  has_more: boolean;
}

export const postsApi = {
  getFeed: (page = 1, limit = 20) =>
    apiFetchJson<PaginatedPostsResponse>(`/posts?page=${page}&limit=${limit}`),

  getTrending: (hours = 24, limit = 20) =>
    apiFetchJson<Post[]>(`/posts/trending?hours=${hours}&limit=${limit}`),

  getBookmarks: (page = 1, limit = 20) =>
    apiFetchJson<PaginatedPostsResponse>(`/posts/bookmarks?page=${page}&limit=${limit}`),

  createPost: (data: CreatePostData) =>
    apiFetchJson<Post>("/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  likePost: (postId: string) =>
    apiFetchJson(`/posts/${postId}/like`, { method: "POST" }),

  unlikePost: (postId: string) =>
    apiFetchJson(`/posts/${postId}/like`, { method: "DELETE" }),

  repost: (postId: string, content = "") =>
    apiFetchJson(`/posts/${postId}/repost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }),

  unrepost: (postId: string) =>
    apiFetchJson(`/posts/${postId}/repost`, { method: "DELETE" }),

  bookmarkPost: (postId: string) =>
    apiFetchJson(`/posts/${postId}/bookmark`, { method: "POST" }),

  unbookmarkPost: (postId: string) =>
    apiFetchJson(`/posts/${postId}/bookmark`, { method: "DELETE" }),

  deletePost: (postId: string) =>
    apiFetchJson(`/posts/${postId}`, { method: "DELETE" }),

  uploadMedia: async (file: File): Promise<{ url: string; type: string; mime_type: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiFetch("/posts/upload-media", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Failed to upload media");
    return res.json();
  },
};
