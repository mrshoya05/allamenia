"use client";
import { useState, useEffect, useCallback } from "react";
import { postsApi, Post, CreatePostData } from "@/lib/api/posts";

export function useFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadFeed = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsApi.getFeed(pageNum, 20);
      
      if (reset) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }
      
      setHasMore(response.has_more);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadFeed(page + 1, false);
    }
  }, [loading, hasMore, page, loadFeed]);

  const refresh = useCallback(() => {
    loadFeed(1, true);
  }, [loadFeed]);

  useEffect(() => {
    loadFeed(1, true);
  }, [loadFeed]);

  return { posts, loading, error, hasMore, loadMore, refresh, setPosts };
}

export function useTrending() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const trendingPosts = await postsApi.getTrending();
      setPosts(trendingPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trending");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  return { posts, loading, error, refresh: loadTrending };
}

export function useBookmarks() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadBookmarks = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsApi.getBookmarks(pageNum, 20);
      
      if (reset) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }
      
      setHasMore(response.has_more);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadBookmarks(page + 1, false);
    }
  }, [loading, hasMore, page, loadBookmarks]);

  useEffect(() => {
    loadBookmarks(1, true);
  }, [loadBookmarks]);

  return { posts, loading, error, hasMore, loadMore, refresh: () => loadBookmarks(1, true) };
}

export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = useCallback(async (data: CreatePostData) => {
    try {
      setLoading(true);
      setError(null);
      const post = await postsApi.createPost(data);
      return post;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create post";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPost, loading, error };
}

export function usePostActions() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setPostLoading = (postId: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [postId]: isLoading }));
  };

  const likePost = useCallback(async (postId: string) => {
    setPostLoading(postId, true);
    try {
      await postsApi.likePost(postId);
    } finally {
      setPostLoading(postId, false);
    }
  }, []);

  const unlikePost = useCallback(async (postId: string) => {
    setPostLoading(postId, true);
    try {
      await postsApi.unlikePost(postId);
    } finally {
      setPostLoading(postId, false);
    }
  }, []);

  const repost = useCallback(async (postId: string, content?: string) => {
    setPostLoading(postId, true);
    try {
      await postsApi.repost(postId, content);
    } finally {
      setPostLoading(postId, false);
    }
  }, []);

  const unrepost = useCallback(async (postId: string) => {
    setPostLoading(postId, true);
    try {
      await postsApi.unrepost(postId);
    } finally {
      setPostLoading(postId, false);
    }
  }, []);

  const bookmarkPost = useCallback(async (postId: string) => {
    setPostLoading(postId, true);
    try {
      await postsApi.bookmarkPost(postId);
    } finally {
      setPostLoading(postId, false);
    }
  }, []);

  const unbookmarkPost = useCallback(async (postId: string) => {
    setPostLoading(postId, true);
    try {
      await postsApi.unbookmarkPost(postId);
    } finally {
      setPostLoading(postId, false);
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    setPostLoading(postId, true);
    try {
      await postsApi.deletePost(postId);
    } finally {
      setPostLoading(postId, false);
    }
  }, []);

  return {
    likePost,
    unlikePost,
    repost,
    unrepost,
    bookmarkPost,
    unbookmarkPost,
    deletePost,
    loading,
  };
}
