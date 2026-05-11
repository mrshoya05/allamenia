const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function getAuthHeaders() {
  const token = localStorage.getItem("allamenia_access_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

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
  media?: Array<{
    type: string;
    url: string;
    width?: number;
    height?: number;
  }>;
  visibility?: "public" | "followers" | "private";
  reply_to_post_id?: string;
}

export const postsApi = {
  async getFeed(page: number = 1, limit: number = 20) {
    const res = await fetch(`${API_BASE}/posts?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch feed");
    return await res.json();
  },

  async getTrending(hours: number = 24, limit: number = 20) {
    const res = await fetch(`${API_BASE}/posts/trending?hours=${hours}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch trending");
    return await res.json();
  },

  async getBookmarks(page: number = 1, limit: number = 20) {
    const res = await fetch(`${API_BASE}/posts/bookmarks?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch bookmarks");
    return await res.json();
  },

  async createPost(data: CreatePostData) {
    const res = await fetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to create post");
    }
    return await res.json();
  },

  async likePost(postId: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to like post");
    return await res.json();
  },

  async unlikePost(postId: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to unlike post");
    return await res.json();
  },

  async repost(postId: string, content: string = "") {
    const res = await fetch(`${API_BASE}/posts/${postId}/repost`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error("Failed to repost");
    return await res.json();
  },

  async unrepost(postId: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/repost`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to unrepost");
    return await res.json();
  },

  async bookmarkPost(postId: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/bookmark`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to bookmark post");
    return await res.json();
  },

  async unbookmarkPost(postId: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/bookmark`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to unbookmark post");
    return await res.json();
  },

  async deletePost(postId: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete post");
    return await res.json();
  },
};
