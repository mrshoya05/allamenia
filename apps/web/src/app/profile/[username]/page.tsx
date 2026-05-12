"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, MapPin, Link2, Calendar, Lock,
  BadgeCheck, MoreHorizontal, UserMinus, ShieldOff, UserX,
  Mail, ShieldCheck, UserPlus
} from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { AppNavbar } from "@/components/ui/AppNavbar";
import { PostCard } from "@/components/posts/PostCard";
import { usePostActions } from "@/hooks/usePosts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
type FollowStatus = "none" | "pending" | "following";

export default function PublicProfilePage() {
  useAuthGuard();
  const router = useRouter();
  const { username } = useParams() as { username: string };

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [followStatus, setFollowStatus] = useState<FollowStatus>("none");
  const [followLoading, setFollowLoading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [blockStatus, setBlockStatus] = useState({ iBlockedThem: false, theyBlockedMe: false });
  const [blockLoading, setBlockLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const actions = usePostActions();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (username) fetchProfile(); }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem("allamenia_access_token");
    if (!token) { router.push("/login"); return; }

    try {
      const meRes = await fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      const me = meRes.ok ? await meRes.json() : null;

      const res = await fetch(`${API}/users/${username}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { router.push("/feed"); return; }
      const data = await res.json();
      setProfile(data);

      const own = me?.username === username;
      setIsOwnProfile(own);

      if (!own && data.id) {
        // Fetch follow status + block status in parallel
        const [statusRes, blockRes] = await Promise.all([
          fetch(`${API}/follows/status/${data.id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/blocks/check/${data.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (statusRes.ok) {
          const s = await statusRes.json();
          if (s.status === "active") setFollowStatus("following");
          else if (s.status === "pending") setFollowStatus("pending");
          else setFollowStatus("none");
        }

        if (blockRes.ok) {
          const b = await blockRes.json();
          setBlockStatus({ iBlockedThem: b.i_blocked_them, theyBlockedMe: b.they_blocked_me });
        }
      }

      if (!blockStatus.iBlockedThem && !blockStatus.theyBlockedMe) {
        fetchPosts(data.username);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (uname: string) => {
    setPostsLoading(true);
    const token = localStorage.getItem("allamenia_access_token");
    try {
      const res = await fetch(`${API}/posts/user/${uname}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPosts((await res.json()).posts || []);
    } catch (e) { console.error(e); }
    finally { setPostsLoading(false); }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    const token = localStorage.getItem("allamenia_access_token");
    try {
      const res = await fetch(`${API}/follows/${profile.id}`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const newStatus = data.status === "pending" ? "pending" : "following";
        setFollowStatus(newStatus);
        if (newStatus === "following") setProfile((p: any) => ({ ...p, followers_count: p.followers_count + 1 }));
      }
    } finally { setFollowLoading(false); }
  };

  const handleUnfollow = async () => {
    setFollowLoading(true);
    const token = localStorage.getItem("allamenia_access_token");
    try {
      await fetch(`${API}/follows/${profile.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      const wasFollowing = followStatus === "following";
      setFollowStatus("none");
      if (wasFollowing) setProfile((p: any) => ({ ...p, followers_count: Math.max(0, p.followers_count - 1) }));
    } finally { setFollowLoading(false); setShowMenu(false); }
  };

  const handleBlock = async () => {
    setBlockLoading(true);
    setShowMenu(false);
    const token = localStorage.getItem("allamenia_access_token");
    try {
      const res = await fetch(`${API}/blocks/${profile.id}`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBlockStatus({ iBlockedThem: true, theyBlockedMe: false });
        setFollowStatus("none");
        setPosts([]);
      }
    } finally { setBlockLoading(false); }
  };

  const handleUnblock = async () => {
    setBlockLoading(true);
    const token = localStorage.getItem("allamenia_access_token");
    try {
      const res = await fetch(`${API}/blocks/${profile.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBlockStatus({ iBlockedThem: false, theyBlockedMe: false });
        fetchPosts(profile.username);
      }
    } finally { setBlockLoading(false); }
  };

  const handleDM = async () => {
    const token = localStorage.getItem("allamenia_access_token");
    const res = await fetch(`${API}/messages/conversations/${profile.id}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/messages/${data.conversation.id}`);
    }
  };

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  if (loading) return (
    <div className="min-h-screen bg-[#000]">
      <AppNavbar />
      <div className="flex justify-center pt-32"><Loader2 className="w-7 h-7 text-[#1d9bf0] animate-spin" /></div>
    </div>
  );

  if (!profile) return null;

  const isBlocked = blockStatus.iBlockedThem;
  const isBlockedByThem = blockStatus.theyBlockedMe;
  const isPrivateAndNotFollowing = profile.is_private && followStatus !== "following" && !isOwnProfile && !isBlocked;

  return (
    <div className="min-h-screen bg-[#000]">
      <AppNavbar />
      <div className="pt-16 max-w-2xl mx-auto">

        {/* Sticky header */}
        <div className="sticky top-16 z-10 bg-[#000]/95 backdrop-blur-xl border-b border-[#2f3336] px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-[#1d1f23]">
            <ArrowLeft className="w-5 h-5 text-[#e7e9ea]" />
          </button>
          <div>
            <h1 className="text-[17px] font-bold text-[#e7e9ea]">{profile.full_name || profile.username}</h1>
            <p className="text-[13px] text-[#71767b]">{isBlocked ? "Blocked" : `${posts.length} posts`}</p>
          </div>
        </div>

        {/* Cover */}
        <div
          className="h-48 bg-[#16181c]"
          style={profile.cover_url ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
        />

        {/* Profile info */}
        <div className="px-4 pb-4">
          {/* Avatar + action buttons */}
          <div className="flex items-end justify-between -mt-12 mb-3">
            <div className={`w-24 h-24 rounded-full border-4 border-[#000] overflow-hidden bg-[#16181c] flex-shrink-0 ${isBlocked ? "opacity-50 grayscale" : ""}`}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#1d9bf0] bg-[#1d9bf0]/10">
                  {(profile.full_name || profile.username)[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-14">
              {isOwnProfile ? (
                <Link href="/profile" className="px-4 py-1.5 rounded-full border border-[#536471] text-[#e7e9ea] text-[14px] font-bold hover:bg-[#1d1f23] transition-colors">
                  Edit profile
                </Link>
              ) : isBlocked ? (
                /* Blocked state */
                <button
                  onClick={handleUnblock}
                  disabled={blockLoading}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-[14px] font-bold transition-all"
                >
                  {blockLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Unblock
                </button>
              ) : isBlockedByThem ? null : (
                <>
                  {/* More options */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 rounded-full border border-[#536471] hover:bg-[#1d1f23] transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5 text-[#e7e9ea]" />
                    </button>
                    {showMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                        <div className="absolute right-0 top-full mt-1 w-56 bg-[#000] border border-[#2f3336] rounded-xl shadow-xl z-20 overflow-hidden">
                          {followStatus !== "none" && (
                            <button
                              onClick={handleUnfollow}
                              className="w-full px-4 py-3 text-left text-[15px] text-[#e7e9ea] hover:bg-[#1d1f23] flex items-center gap-3"
                            >
                              <UserMinus className="w-4 h-4" />
                              {followStatus === "pending" ? "Cancel request" : `Unfollow @${profile.username}`}
                            </button>
                          )}
                          <button
                            onClick={handleBlock}
                            disabled={blockLoading}
                            className="w-full px-4 py-3 text-left text-[15px] text-red-500 hover:bg-[#1d1f23] flex items-center gap-3"
                          >
                            <ShieldOff className="w-4 h-4" />
                            Block @{profile.username}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* DM button */}
                  <button
                    onClick={handleDM}
                    className="p-2 rounded-full border border-[#536471] hover:bg-[#1d1f23] transition-colors"
                    title="Send message"
                  >
                    <Mail className="w-5 h-5 text-[#e7e9ea]" />
                  </button>

                  {/* Follow button */}
                  <button
                    onClick={followStatus === "none" ? handleFollow : handleUnfollow}
                    disabled={followLoading}
                    className={`px-5 py-1.5 rounded-full text-[14px] font-bold transition-all flex items-center gap-1.5 ${
                      followStatus === "following"
                        ? "border border-[#536471] text-[#e7e9ea] hover:border-red-500 hover:text-red-500 hover:bg-red-500/10"
                        : followStatus === "pending"
                        ? "border border-[#536471] text-[#71767b]"
                        : "bg-[#e7e9ea] hover:bg-[#d7dbdc] text-[#0f1419]"
                    } disabled:opacity-60`}
                  >
                    {followLoading ? <Loader2 className="w-4 h-4 animate-spin" />
                      : followStatus === "following" ? "Following"
                      : followStatus === "pending" ? "Requested"
                      : "Follow"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name + username */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5">
              <h2 className={`text-[20px] font-bold ${isBlocked ? "text-[#71767b]" : "text-[#e7e9ea]"}`}>
                {profile.full_name || profile.username}
              </h2>
              {profile.is_verified && !isBlocked && <BadgeCheck className="w-5 h-5 text-[#1d9bf0] fill-[#1d9bf0]" />}
              {profile.is_private && <Lock className="w-4 h-4 text-[#71767b]" />}
            </div>
            <p className="text-[#71767b] text-[15px]">@{profile.username}</p>
          </div>

          {/* Blocked banner */}
          {isBlocked && (
            <div className="mb-4 p-4 bg-[#16181c] border border-[#2f3336] rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <ShieldOff className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-[#e7e9ea]">You blocked @{profile.username}</p>
                  <p className="text-[13px] text-[#71767b] mt-0.5">
                    They can't follow you, see your posts, or message you.
                  </p>
                </div>
                <button
                  onClick={handleUnblock}
                  disabled={blockLoading}
                  className="px-4 py-1.5 rounded-full border border-[#536471] text-[#e7e9ea] text-[13px] font-bold hover:bg-[#1d1f23] transition-colors flex-shrink-0"
                >
                  {blockLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Unblock"}
                </button>
              </div>
            </div>
          )}

          {/* Blocked by them banner */}
          {isBlockedByThem && !isBlocked && (
            <div className="mb-4 p-4 bg-[#16181c] border border-[#2f3336] rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#71767b]/10 flex items-center justify-center flex-shrink-0">
                  <ShieldOff className="w-5 h-5 text-[#71767b]" />
                </div>
                <p className="text-[14px] text-[#71767b]">
                  You can't follow or message @{profile.username}.
                </p>
              </div>
            </div>
          )}

          {/* Bio + meta - hide if blocked */}
          {!isBlocked && !isBlockedByThem && (
            <>
              {profile.bio && <p className="text-[#e7e9ea] text-[15px] leading-normal mb-3">{profile.bio}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-[#71767b] text-[14px]">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>}
                {profile.website && (
                  <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#1d9bf0] hover:underline">
                    <Link2 className="w-4 h-4" />
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {joinDate && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {joinDate}</span>}
              </div>
              <div className="flex gap-5 text-[14px]">
                <Link href={`/profile/${username}/followers?tab=following`} className="hover:underline">
                  <span className="font-bold text-[#e7e9ea]">{formatCount(profile.following_count || 0)}</span>
                  <span className="text-[#71767b] ml-1">Following</span>
                </Link>
                <Link href={`/profile/${username}/followers?tab=followers`} className="hover:underline">
                  <span className="font-bold text-[#e7e9ea]">{formatCount(profile.followers_count || 0)}</span>
                  <span className="text-[#71767b] ml-1">Followers</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Content area */}
        <div className="border-t border-[#2f3336]">
          {isBlocked ? (
            <div className="flex flex-col items-center py-16 px-8 text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                <ShieldOff className="w-8 h-8 text-red-500/60" />
              </div>
              <h3 className="text-[18px] font-bold text-[#e7e9ea]">@{profile.username} is blocked</h3>
              <p className="text-[#71767b] text-[14px] max-w-xs">
                Unblock to see their posts and interact with them.
              </p>
              <button
                onClick={handleUnblock}
                disabled={blockLoading}
                className="mt-2 px-6 py-2 rounded-full bg-[#e7e9ea] hover:bg-[#d7dbdc] text-[#0f1419] text-[14px] font-bold transition-all flex items-center gap-2"
              >
                {blockLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Unblock @{profile.username}
              </button>
            </div>
          ) : isBlockedByThem ? (
            <div className="flex flex-col items-center py-16 px-8 text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#16181c] flex items-center justify-center mb-2">
                <Lock className="w-8 h-8 text-[#71767b]" />
              </div>
              <h3 className="text-[18px] font-bold text-[#e7e9ea]">Content not available</h3>
              <p className="text-[#71767b] text-[14px] max-w-xs">
                You can't view this profile or interact with @{profile.username}.
              </p>
            </div>
          ) : isPrivateAndNotFollowing ? (
            <div className="flex flex-col items-center py-16 px-8 text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#16181c] flex items-center justify-center mb-2">
                <Lock className="w-8 h-8 text-[#71767b]" />
              </div>
              <h3 className="text-[20px] font-bold text-[#e7e9ea]">This account is private</h3>
              <p className="text-[#71767b] text-[15px] max-w-xs">Follow @{profile.username} to see their posts.</p>
              {followStatus === "pending" && <p className="text-[#1d9bf0] text-[14px]">Follow request sent</p>}
            </div>
          ) : postsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-[#1d9bf0] animate-spin" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-[#71767b]">
              <p className="text-[17px] font-bold text-[#e7e9ea] mb-1">No posts yet</p>
              <p className="text-[14px]">When @{profile.username} posts, you'll see it here.</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={actions.likePost}
                onUnlike={actions.unlikePost}
                onRepost={async (id) => {
                  const p = posts.find(x => x.id === id);
                  if (p?.is_reposted) await actions.unrepost(id);
                  else await actions.repost(id);
                }}
                onBookmark={async (id) => {
                  const p = posts.find(x => x.id === id);
                  if (p?.is_bookmarked) await actions.unbookmarkPost(id);
                  else await actions.bookmarkPost(id);
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
