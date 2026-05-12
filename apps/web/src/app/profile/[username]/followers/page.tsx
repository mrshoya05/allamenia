"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { AppNavbar } from "@/components/ui/AppNavbar";
import { UserCard } from "@/components/people/UserCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type TabType = "followers" | "following";

export default function FollowersPage() {
  useAuthGuard();
  const router = useRouter();
  const { username } = useParams() as { username: string };
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "followers";

  const [tab, setTab] = useState<TabType>(initialTab);
  const [userId, setUserId] = useState<string | null>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileName, setProfileName] = useState(username);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    fetchUserAndLists();
  }, [username]);

  const fetchUserAndLists = async () => {
    setLoading(true);
    const token = localStorage.getItem("allamenia_access_token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Get user profile to get their ID
      const profileRes = await fetch(`${API}/users/${username}`, { headers });
      if (!profileRes.ok) return;
      const profile = await profileRes.json();
      const uid = profile.id;
      setUserId(uid);
      setProfileName(profile.full_name || profile.username);

      // Check if own profile
      const meRes = await fetch(`${API}/users/me`, { headers });
      if (meRes.ok) {
        const me = await meRes.json();
        setIsOwnProfile(me.username === username);
      }

      // Fetch both lists in parallel
      const [frsRes, fngRes] = await Promise.all([
        fetch(`${API}/follows/${uid}/followers?limit=100`, { headers }),
        fetch(`${API}/follows/${uid}/following?limit=100`, { headers }),
      ]);

      if (frsRes.ok) {
        const d = await frsRes.json();
        setFollowers(d.users || []);
      }
      if (fngRes.ok) {
        const d = await fngRes.json();
        setFollowing(d.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    const token = localStorage.getItem("allamenia_access_token");
    const res = await fetch(`${API}/follows/${targetUserId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok ? res.json() : {};
  };

  const handleUnfollow = async (targetUserId: string) => {
    const token = localStorage.getItem("allamenia_access_token");
    await fetch(`${API}/follows/${targetUserId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleBlock = async (targetUserId: string) => {
    const token = localStorage.getItem("allamenia_access_token");
    await fetch(`${API}/blocks/${targetUserId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setFollowers(u => u.filter(x => x.id !== targetUserId));
    setFollowing(u => u.filter(x => x.id !== targetUserId));
  };

  // Remove a follower from YOUR followers list (only on own profile)
  const handleRemoveFollower = async (targetUserId: string) => {
    const token = localStorage.getItem("allamenia_access_token");
    await fetch(`${API}/follows/remove/${targetUserId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setFollowers(u => u.filter(x => x.id !== targetUserId));
  };

  const getFollowStatus = (user: any): "none" | "pending" | "following" => {
    if (!user.follow_status) return "none";
    if (user.follow_status === "active") return "following";
    if (user.follow_status === "pending") return "pending";
    return "none";
  };

  const rawList = tab === "followers" ? followers : following;
  const list = searchQuery.trim()
    ? rawList.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rawList;

  return (
    <div className="min-h-screen bg-[#000]">
      <AppNavbar />
      <div className="pt-16 max-w-2xl mx-auto">

        {/* Header */}
        <div className="sticky top-16 z-10 bg-[#000]/95 backdrop-blur-xl border-b border-[#2f3336]">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-[#1d1f23] transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#e7e9ea]" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-[#e7e9ea]">{profileName}</h1>
              <p className="text-[13px] text-[#71767b]">@{username}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => setTab("followers")}
              className={`flex-1 py-4 text-[15px] font-medium transition-colors relative ${
                tab === "followers" ? "text-[#e7e9ea]" : "text-[#71767b] hover:bg-[#1d1f23]"
              }`}
            >
              <span className="font-bold text-[#e7e9ea]">{followers.length.toLocaleString()}</span>
              <span className="ml-1 text-[#71767b]">Followers</span>
              {tab === "followers" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1d9bf0] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setTab("following")}
              className={`flex-1 py-4 text-[15px] font-medium transition-colors relative ${
                tab === "following" ? "text-[#e7e9ea]" : "text-[#71767b] hover:bg-[#1d1f23]"
              }`}
            >
              <span className="font-bold text-[#e7e9ea]">{following.length.toLocaleString()}</span>
              <span className="ml-1 text-[#71767b]">Following</span>
              {tab === "following" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1d9bf0] rounded-full" />
              )}
            </button>
          </div>

          {/* Search within list */}
          {rawList.length > 5 && (
            <div className="px-4 py-2 border-t border-[#2f3336]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71767b]" />
                <input
                  type="text"
                  placeholder={`Search ${tab}...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#16181c] border border-[#2f3336] rounded-full pl-9 pr-4 py-2 text-[14px] text-[#e7e9ea] placeholder:text-[#71767b] focus:outline-none focus:border-[#1d9bf0]"
                />
              </div>
            </div>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#1d9bf0] animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-[#71767b]">
            <p className="text-[17px] font-bold text-[#e7e9ea]">
              {searchQuery ? "No results" : tab === "followers" ? "No followers yet" : "Not following anyone"}
            </p>
            <p className="text-[14px]">
              {!searchQuery && (tab === "followers"
                ? "When someone follows this account, they'll show up here."
                : "When this account follows someone, they'll show up here.")}
            </p>
          </div>
        ) : (
          list.map(user => (
            <UserCard
              key={user.id}
              user={user}
              followStatus={getFollowStatus(user)}
              onFollow={() => handleFollow(user.id)}
              onUnfollow={() => handleUnfollow(user.id)}
              onBlock={() => handleBlock(user.id)}
              onRemoveFollower={isOwnProfile && tab === "followers" ? () => handleRemoveFollower(user.id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
