"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/ui/AppNavbar";
import { Feed } from "@/components/posts/Feed";
import { VibeCheckWidget } from "@/components/sidebar/VibeCheckWidget";
import { QuickActionsWidget } from "@/components/sidebar/QuickActionsWidget";
import { TrendingWidget } from "@/components/sidebar/TrendingWidget";
import { WhoToFollowWidget } from "@/components/sidebar/WhoToFollowWidget";
import { MobileWidgetsDrawer } from "@/components/sidebar/MobileWidgetsDrawer";
import { useFeed, useTrending, useBookmarks, useCreatePost, usePostActions } from "@/hooks/usePosts";

export default function FeedPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"foryou" | "trending" | "bookmarks">("foryou");
  
  const feedData = useFeed();
  const trendingData = useTrending();
  const bookmarksData = useBookmarks();
  const { createPost } = useCreatePost();
  const actions = usePostActions();

  useEffect(() => {
    const token = localStorage.getItem("allamenia_access_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const getCurrentData = () => {
    switch (activeTab) {
      case "trending": return trendingData;
      case "bookmarks": return bookmarksData;
      default: return feedData;
    }
  };

  const currentData = getCurrentData();

  const handleCreatePost = async (data: { content: string; media: any[] }) => {
    try {
      const newPost = await createPost({
        content: data.content,
        media: data.media,
        visibility: "public",
      });
      if (activeTab === "foryou") {
        feedData.setPosts(prev => [newPost, ...prev]);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const handleLike = async (postId: string) => {
    const updatePosts = (posts: any[]) => 
      posts.map(p => p.id === postId ? { ...p, is_liked: true, likes_count: p.likes_count + 1 } : p);
    
    if (activeTab === "foryou") feedData.setPosts(updatePosts);
    else if (activeTab === "trending") trendingData.posts = updatePosts(trendingData.posts);
    else bookmarksData.posts = updatePosts(bookmarksData.posts);
    
    await actions.likePost(postId);
  };

  const handleUnlike = async (postId: string) => {
    const updatePosts = (posts: any[]) => 
      posts.map(p => p.id === postId ? { ...p, is_liked: false, likes_count: p.likes_count - 1 } : p);
    
    if (activeTab === "foryou") feedData.setPosts(updatePosts);
    else if (activeTab === "trending") trendingData.posts = updatePosts(trendingData.posts);
    else bookmarksData.posts = updatePosts(bookmarksData.posts);
    
    await actions.unlikePost(postId);
  };

  const handleRepost = async (postId: string) => {
    await actions.repost(postId);
    currentData.refresh?.();
  };

  const handleBookmark = async (postId: string) => {
    const updatePosts = (posts: any[]) => 
      posts.map(p => p.id === postId ? { ...p, is_bookmarked: !p.is_bookmarked } : p);
    
    if (activeTab === "foryou") feedData.setPosts(updatePosts);
    else if (activeTab === "trending") trendingData.posts = updatePosts(trendingData.posts);
    
    const post = currentData.posts.find((p: any) => p.id === postId);
    if (post?.is_bookmarked) {
      await actions.unbookmarkPost(postId);
    } else {
      await actions.bookmarkPost(postId);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await actions.deletePost(postId);
      if (activeTab === "foryou") {
        feedData.setPosts(prev => prev.filter(p => p.id !== postId));
      } else if (activeTab === "bookmarks") {
        bookmarksData.posts = bookmarksData.posts.filter((p: any) => p.id !== postId);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000]">
      <AppNavbar />

      {/* Mobile Widgets Drawer - Floating Button */}
      <MobileWidgetsDrawer />

      {/* Main Container with Responsive Layout */}
      <div className="pt-16">
        <div className="w-full flex flex-col lg:flex-row justify-center">
          {/* Main Feed */}
          <main className="w-full lg:max-w-[600px] border-x border-[#2f3336]">
            {/* Tabs */}
            <div className="sticky top-16 z-20 bg-[#000000]/80 backdrop-blur-xl border-b border-[#2f3336]">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("foryou")}
                  className={`flex-1 px-4 py-4 font-bold text-[15px] transition-colors relative ${
                    activeTab === "foryou"
                      ? "text-[#e7e9ea]"
                      : "text-[#71767b] hover:bg-[#16181c]"
                  }`}
                >
                  For You
                  {activeTab === "foryou" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1d9bf0] rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("trending")}
                  className={`flex-1 px-4 py-4 font-bold text-[15px] transition-colors relative ${
                    activeTab === "trending"
                      ? "text-[#e7e9ea]"
                      : "text-[#71767b] hover:bg-[#16181c]"
                  }`}
                >
                  Trending
                  {activeTab === "trending" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1d9bf0] rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("bookmarks")}
                  className={`flex-1 px-4 py-4 font-bold text-[15px] transition-colors relative ${
                    activeTab === "bookmarks"
                      ? "text-[#e7e9ea]"
                      : "text-[#71767b] hover:bg-[#16181c]"
                  }`}
                >
                  Bookmarks
                  {activeTab === "bookmarks" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1d9bf0] rounded-full" />
                  )}
                </button>
              </div>
            </div>

            {/* Feed with clean mobile experience */}
            <Feed
              key={activeTab}
              initialPosts={currentData.posts}
              loading={currentData.loading}
              hasMore={"hasMore" in currentData ? currentData.hasMore : false}
              showComposer={activeTab === "foryou"}
              activeTab={activeTab}
              onLoadMore={"loadMore" in currentData ? currentData.loadMore : undefined}
              onCreatePost={activeTab === "foryou" ? handleCreatePost : undefined}
              onLike={handleLike}
              onUnlike={handleUnlike}
              onRepost={handleRepost}
              onBookmark={handleBookmark}
              onDelete={handleDelete}
            />
          </main>

          {/* Desktop Sidebar - Show on right side on desktop */}
          <aside className="hidden lg:block w-full max-w-[350px] px-6 py-4 min-h-screen">
            <div className="space-y-4">
              {/* Vibe Check Widget - GenZ Style */}
              <VibeCheckWidget />

              {/* Quick Actions Widget */}
              <QuickActionsWidget />

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-[#16181c] border border-[#2f3336] rounded-full px-4 py-3 pl-12 text-[15px] text-[#e7e9ea] placeholder:text-[#71767b] focus:outline-none focus:border-[#1d9bf0] transition-colors"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71767b]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Trending Widget */}
              <TrendingWidget />

              {/* Who to Follow Widget */}
              <WhoToFollowWidget />

              {/* Premium Upgrade Card */}
              <div className="bg-gradient-to-br from-[#1d9bf0]/10 to-purple-500/10 rounded-2xl p-6 border border-[#1d9bf0]/30">
                <h3 className="text-[19px] font-bold text-[#e7e9ea] mb-2">
                  Subscribe to Premium
                </h3>
                <p className="text-[14px] text-[#71767b] mb-4">
                  Subscribe to unlock new features and if eligible, receive a share of ads revenue.
                </p>
                <button className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold py-3 rounded-full transition-colors">
                  Subscribe
                </button>
              </div>

              {/* Community Stats */}
              <div className="bg-[#16181c] rounded-2xl p-4 border border-[#2f3336]">
                <h3 className="text-[17px] font-bold text-[#e7e9ea] mb-3">Community Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#71767b]">Total Users</span>
                    <span className="text-[14px] font-bold text-[#e7e9ea]">1.2M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#71767b]">Posts Today</span>
                    <span className="text-[14px] font-bold text-[#e7e9ea]">45.3K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#71767b]">Active Now</span>
                    <span className="text-[14px] font-bold text-green-500">8.7K</span>
                  </div>
                </div>
              </div>

              {/* Footer Links */}
              <div className="px-4 py-3 text-[#71767b] text-[13px] space-y-2">
                <div className="flex flex-wrap gap-3">
                  <a href="#" className="hover:underline">Terms of Service</a>
                  <a href="#" className="hover:underline">Privacy Policy</a>
                  <a href="#" className="hover:underline">Cookie Policy</a>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="#" className="hover:underline">Accessibility</a>
                  <a href="#" className="hover:underline">Ads info</a>
                  <a href="#" className="hover:underline">More</a>
                </div>
                <p className="mt-2">© 2026 Allamenia</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
